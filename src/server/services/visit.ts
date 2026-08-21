import "server-only";
import { revalidatePath } from "next/cache";
import type { Priority } from "@prisma/client";
import { db } from "@/server/db";
import { resolveTransition, visitMachine, type VisitEvent } from "@/server/fsm";
import { availableTransitions } from "@/server/fsm";
import type { Actor } from "@/server/session";
import { makeCode } from "./ids";
import { logTransition, notifyRole } from "./events";

export interface TransitionPayload {
  doctorId?: string;
  vitals?: {
    temperatureC?: number;
    pulseBpm?: number;
    systolic?: number;
    diastolic?: number;
    respRate?: number;
    spo2?: number;
    weightKg?: number;
    heightCm?: number;
    notes?: string;
  };
  testIds?: string[];
  labNotes?: string;
  drugs?: Array<{
    medicationId: string;
    dose?: string;
    frequency?: string;
    duration?: string;
    quantity: number;
    instructions?: string;
  }>;
  referral?: {
    toFacility: string;
    toDepartment?: string;
    reason: string;
    clinicalSummary?: string;
    urgency?: "ROUTINE" | "URGENT" | "EMERGENCY";
  };
  admission?: { wardId?: string; bedId?: string; reason?: string };
  diagnosis?: { chiefComplaint?: string; symptoms?: string; diagnosis?: string; disease?: string; icdCode?: string; notes?: string };
  reason?: string;
}

/** Affordances (available actions) for a visit given the actor's role. */
export function visitAffordances(state: string, actor: Actor) {
  return availableTransitions(visitMachine, state as never, { role: actor.role });
}

/**
 * The single entry point for advancing a visit. Validates the transition through
 * the FSM (state + role), applies the event's side-effects atomically, records the
 * transition, and notifies the next team.
 */
export async function transitionVisit(
  visitId: string,
  event: VisitEvent,
  actor: Actor,
  payload: TransitionPayload = {},
) {
  const visit = await db.visit.findUnique({ where: { id: visitId } });
  if (!visit) throw new Error("Visit not found");

  // FSM gate — throws FsmError if illegal or unauthorized.
  const { to } = resolveTransition(visitMachine, visit.state, event, { role: actor.role });

  await db.$transaction(async (tx) => {
    switch (event) {
      case "start_triage": {
        if (payload.vitals) {
          await tx.vitals.create({ data: { visitId, takenById: actor.id, ...payload.vitals } });
        }
        break;
      }
      case "send_to_doctor": {
        if (payload.doctorId) {
          await tx.visit.update({ where: { id: visitId }, data: { doctorId: payload.doctorId } });
        }
        break;
      }
      case "begin_consultation": {
        if (!visit.doctorId) {
          await tx.visit.update({ where: { id: visitId }, data: { doctorId: actor.id } });
        }
        break;
      }
      case "order_labs": {
        const testIds = payload.testIds ?? [];
        if (testIds.length === 0) throw new Error("Select at least one test");
        const seq = (await tx.labOrder.count()) + 1;
        await tx.labOrder.create({
          data: {
            orderNo: makeCode("L", seq),
            state: "ORDERED",
            visitId,
            orderedById: actor.id,
            notes: payload.labNotes,
            items: { create: testIds.map((testId) => ({ testId })) },
          },
        });
        await notifyRole(tx, "LAB_TECH", {
          type: "LAB_ORDER_NEW",
          title: "New lab order",
          body: `${testIds.length} test(s) ordered`,
          link: "/lab",
        });
        break;
      }
      case "prescribe": {
        const drugs = payload.drugs ?? [];
        if (drugs.length === 0) throw new Error("Add at least one medication");
        const seq = (await tx.drugOrder.count()) + 1;
        await tx.drugOrder.create({
          data: {
            orderNo: makeCode("D", seq),
            state: "ORDERED",
            visitId,
            prescribedById: actor.id,
            items: { create: drugs.map((d) => ({ ...d })) },
          },
        });
        await notifyRole(tx, "PHARMACIST", {
          type: "DRUG_ORDER_NEW",
          title: "New prescription",
          body: `${drugs.length} item(s) to dispense`,
          link: "/pharmacy",
        });
        break;
      }
      case "refer": {
        const r = payload.referral;
        if (!r) throw new Error("Referral details required");
        const seq = (await tx.referral.count()) + 1;
        await tx.referral.create({
          data: {
            referralNo: makeCode("R", seq),
            state: "ISSUED",
            urgency: r.urgency ?? "ROUTINE",
            visitId,
            patientId: visit.patientId,
            referredById: actor.id,
            toFacility: r.toFacility,
            toDepartment: r.toDepartment,
            reason: r.reason,
            clinicalSummary: r.clinicalSummary,
            issuedAt: new Date(),
          },
        });
        break;
      }
      case "admit": {
        const a = payload.admission ?? {};
        const seq = (await tx.admission.count()) + 1;
        await tx.admission.create({
          data: {
            admNo: makeCode("A", seq),
            state: "ADMITTED",
            visitId,
            patientId: visit.patientId,
            wardId: a.wardId,
            bedId: a.bedId,
            admittedById: actor.id,
            reason: a.reason,
          },
        });
        if (a.bedId) {
          await tx.bed.update({ where: { id: a.bedId }, data: { status: "OCCUPIED" } });
        }
        await notifyRole(tx, "NURSE", {
          type: "ADMISSION",
          title: "New admission",
          body: "A patient was admitted to a ward",
          link: "/wards",
        });
        break;
      }
      case "complete": {
        const d = payload.diagnosis ?? {};
        await tx.visit.update({
          where: { id: visitId },
          data: { ...d, closedAt: new Date() },
        });
        break;
      }
      case "dispensed":
      case "discharge": {
        await tx.visit.update({ where: { id: visitId }, data: { closedAt: new Date() } });
        break;
      }
      case "cancel": {
        await tx.visit.update({
          where: { id: visitId },
          data: { closedAt: new Date(), notes: payload.reason ?? visit.notes },
        });
        break;
      }
      default:
        break;
    }

    await tx.visit.update({ where: { id: visitId }, data: { state: to } });
    await logTransition(tx, {
      entityType: "Visit",
      entityId: visitId,
      event,
      from: visit.state,
      to,
      actorId: actor.id,
      note: payload.reason,
    });
  });

  revalidatePath(`/visits/${visitId}`);
  revalidatePath("/doctor");
  revalidatePath("/dashboard");
  return { to };
}

/** Save consultation clinical fields without changing state. */
export async function saveConsultation(
  visitId: string,
  data: TransitionPayload["diagnosis"],
  actor: Actor,
) {
  await db.visit.update({ where: { id: visitId }, data: { ...data } });
  await db.clinicalNote.create({
    data: { visitId, authorId: actor.id, kind: "ASSESSMENT", body: data?.diagnosis ?? "Updated consultation notes" },
  });
  revalidatePath(`/visits/${visitId}`);
}
