import "server-only";
import { revalidatePath } from "next/cache";
import { db } from "@/server/db";
import {
  admissionMachine,
  availableTransitions,
  resolveTransition,
  type AdmissionEvent,
} from "@/server/fsm";
import type { Actor } from "@/server/session";
import { logTransition } from "./events";

export interface AdmissionTransitionPayload {
  /** Bed to settle the patient into (on `settle`). */
  bedId?: string;
  /** Free-text discharge notes (on `discharge`). */
  dischargeNotes?: string;
  /** Reason / note recorded on the transition (e.g. cancellation reason). */
  reason?: string;
}

/** Affordances (available actions) for an admission given the actor's role. */
export function admissionAffordances(state: string, actor: Actor) {
  return availableTransitions(admissionMachine, state as never, { role: actor.role });
}

/**
 * The single entry point for advancing an admission. Validates the transition
 * through the FSM (state + role), applies the event's side-effects atomically
 * (bed occupancy, discharge bookkeeping, linked-visit completion), records the
 * transition, then revalidates the ward views.
 */
export async function transitionAdmission(
  admissionId: string,
  event: AdmissionEvent,
  actor: Actor,
  payload: AdmissionTransitionPayload = {},
) {
  const admission = await db.admission.findUnique({
    where: { id: admissionId },
    include: { visit: true },
  });
  if (!admission) throw new Error("Admission not found");

  // FSM gate — throws FsmError if illegal or unauthorized.
  const { to } = resolveTransition(admissionMachine, admission.state, event, { role: actor.role });

  await db.$transaction(async (tx) => {
    switch (event) {
      case "settle": {
        // Optionally place the patient into (or move them to) a specific bed.
        if (payload.bedId && payload.bedId !== admission.bedId) {
          if (admission.bedId) {
            await tx.bed.update({ where: { id: admission.bedId }, data: { status: "AVAILABLE" } });
          }
          await tx.bed.update({ where: { id: payload.bedId }, data: { status: "OCCUPIED" } });
          await tx.admission.update({ where: { id: admissionId }, data: { bedId: payload.bedId } });
        }
        break;
      }
      case "discharge": {
        await tx.admission.update({
          where: { id: admissionId },
          data: { dischargedAt: new Date(), dischargeNotes: payload.dischargeNotes ?? admission.dischargeNotes },
        });
        if (admission.bedId) {
          await tx.bed.update({ where: { id: admission.bedId }, data: { status: "AVAILABLE" } });
        }
        // If the originating visit is still ADMITTED, close it out.
        if (admission.visitId && admission.visit?.state === "ADMITTED") {
          await tx.visit.update({
            where: { id: admission.visitId },
            data: { state: "COMPLETED", closedAt: new Date() },
          });
          await logTransition(tx, {
            entityType: "Visit",
            entityId: admission.visitId,
            event: "discharge",
            from: "ADMITTED",
            to: "COMPLETED",
            actorId: actor.id,
            note: "Patient discharged from ward",
          });
        }
        break;
      }
      case "cancel": {
        if (admission.bedId) {
          await tx.bed.update({ where: { id: admission.bedId }, data: { status: "AVAILABLE" } });
        }
        break;
      }
      default:
        break;
    }

    await tx.admission.update({ where: { id: admissionId }, data: { state: to } });
    await logTransition(tx, {
      entityType: "Admission",
      entityId: admissionId,
      event,
      from: admission.state,
      to,
      actorId: actor.id,
      note: payload.reason ?? payload.dischargeNotes,
    });
  });

  revalidatePath("/wards");
  revalidatePath(`/wards/${admissionId}`);
  return { to };
}

/**
 * Move an active admission to a different bed: free the old bed, occupy the new
 * one, repoint the admission, and record the move in the audit trail.
 */
export async function transferBed(admissionId: string, newBedId: string, actor: Actor) {
  const admission = await db.admission.findUnique({ where: { id: admissionId } });
  if (!admission) throw new Error("Admission not found");
  if (admission.state !== "ADMITTED" && admission.state !== "ON_WARD") {
    throw new Error("Only active admissions can change beds");
  }
  if (newBedId === admission.bedId) throw new Error("Patient is already in that bed");

  const newBed = await db.bed.findUnique({ where: { id: newBedId } });
  if (!newBed) throw new Error("Target bed not found");
  if (newBed.status === "OCCUPIED") throw new Error("Target bed is occupied");
  if (newBed.status === "MAINTENANCE") throw new Error("Target bed is under maintenance");

  await db.$transaction(async (tx) => {
    if (admission.bedId) {
      await tx.bed.update({ where: { id: admission.bedId }, data: { status: "AVAILABLE" } });
    }
    await tx.bed.update({ where: { id: newBedId }, data: { status: "OCCUPIED" } });
    await tx.admission.update({
      where: { id: admissionId },
      data: { bedId: newBedId, wardId: newBed.wardId },
    });
    await logTransition(tx, {
      entityType: "Admission",
      entityId: admissionId,
      event: "transfer_bed",
      from: admission.state,
      to: admission.state,
      actorId: actor.id,
      note: `Moved to bed ${newBed.label}`,
    });
  });

  revalidatePath("/wards");
  revalidatePath(`/wards/${admissionId}`);
}

/**
 * Ward occupancy snapshot: every active ward with its beds, and — for each bed —
 * the patient currently occupying it (from active admissions).
 */
export async function wardOccupancy() {
  const [wards, activeAdmissions] = await Promise.all([
    db.ward.findMany({
      where: { isActive: true },
      include: { beds: { orderBy: { label: "asc" } } },
      orderBy: { name: "asc" },
    }),
    db.admission.findMany({
      where: { state: { in: ["ADMITTED", "ON_WARD"] } },
      include: { patient: { select: { id: true, name: true, mrn: true, gender: true } } },
    }),
  ]);

  const occupantByBed = new Map<string, (typeof activeAdmissions)[number]>();
  for (const adm of activeAdmissions) {
    if (adm.bedId) occupantByBed.set(adm.bedId, adm);
  }

  return wards.map((ward) => {
    const beds = ward.beds.map((bed) => ({
      ...bed,
      occupant: occupantByBed.get(bed.id) ?? null,
    }));
    const total = beds.length;
    const occupied = beds.filter((b) => b.status === "OCCUPIED").length;
    const available = beds.filter((b) => b.status === "AVAILABLE").length;
    const maintenance = beds.filter((b) => b.status === "MAINTENANCE").length;
    return {
      ...ward,
      beds,
      total,
      occupied,
      available,
      maintenance,
      occupancyPct: total > 0 ? Math.round((occupied / total) * 100) : 0,
    };
  });
}
