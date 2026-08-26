import "server-only";
import { revalidatePath } from "next/cache";
import { db } from "@/server/db";
import {
  appointmentMachine,
  availableTransitions,
  resolveTransition,
  type AppointmentEvent,
} from "@/server/fsm";
import type { Actor } from "@/server/session";
import { makeCode } from "./ids";
import { logTransition, notifyUser } from "./events";
import { createVisitAndQueue } from "./patient";

export interface CreateAppointmentInput {
  patientId: string;
  providerId?: string;
  scheduledFor: Date;
  durationMin?: number;
  reason?: string;
}

export interface AppointmentTransitionPayload {
  reason?: string;
}

/** Affordances (available actions) for an appointment given the actor's role. */
export function appointmentAffordances(state: string, actor: Actor) {
  return availableTransitions(appointmentMachine, state as never, { role: actor.role });
}

/**
 * Book a new appointment. Creates it in SCHEDULED with a human-friendly apptNo,
 * notifies the assigned provider (if any) and records the opening transition.
 */
export async function createAppointment(input: CreateAppointmentInput, actor: Actor) {
  const seq = (await db.appointment.count()) + 1;

  const appt = await db.$transaction(async (tx) => {
    const created = await tx.appointment.create({
      data: {
        apptNo: makeCode("APT", seq),
        state: "SCHEDULED",
        patientId: input.patientId,
        providerId: input.providerId || null,
        scheduledFor: input.scheduledFor,
        durationMin: input.durationMin ?? 20,
        reason: input.reason,
        createdById: actor.id,
      },
      include: { patient: true },
    });

    await logTransition(tx, {
      entityType: "Appointment",
      entityId: created.id,
      event: "create",
      from: "-",
      to: "SCHEDULED",
      actorId: actor.id,
    });

    if (created.providerId) {
      await notifyUser(tx, created.providerId, {
        type: "GENERIC",
        title: "New appointment booked",
        body: `${created.patient.name} scheduled for you`,
        link: `/appointments/${created.id}`,
      });
    }

    return created;
  });

  revalidatePath("/appointments");
  revalidatePath(`/appointments/${appt.id}`);
  return appt;
}

/**
 * The single entry point for advancing an appointment. Validates the transition
 * through the FSM (state + role), applies side-effects, records the transition.
 *
 * On `check_in` a real visit is opened for the patient and queued to the doctor,
 * so the front desk hand-off flows straight into the clinical spine. The created
 * visit id is stored on the check-in transition's `meta` so the detail page can
 * link back to it.
 */
export async function transitionAppointment(
  id: string,
  event: AppointmentEvent,
  actor: Actor,
  payload: AppointmentTransitionPayload = {},
) {
  const appt = await db.appointment.findUnique({ where: { id } });
  if (!appt) throw new Error("Appointment not found");

  // FSM gate — throws FsmError if illegal or unauthorized.
  const { to } = resolveTransition(appointmentMachine, appt.state, event, { role: actor.role });

  // Opening a visit runs its own transactions (createVisitAndQueue), so it is
  // performed before we record the appointment's own state change.
  let createdVisitId: string | undefined;
  if (event === "check_in") {
    const visit = await createVisitAndQueue(
      appt.patientId,
      { chiefComplaint: appt.reason ?? undefined, doctorId: appt.providerId ?? undefined },
      actor,
    );
    createdVisitId = visit.id;
  }

  await db.$transaction(async (tx) => {
    await tx.appointment.update({
      where: { id },
      data: {
        state: to,
        notes: payload.reason ? payload.reason : appt.notes,
      },
    });
    await logTransition(tx, {
      entityType: "Appointment",
      entityId: id,
      event,
      from: appt.state,
      to,
      actorId: actor.id,
      note: payload.reason,
      meta: createdVisitId ? { visitId: createdVisitId } : undefined,
    });
  });

  revalidatePath("/appointments");
  revalidatePath(`/appointments/${id}`);
  revalidatePath("/doctor");
  return { to, visitId: createdVisitId };
}

/** The visit opened when an appointment was checked in, if any. */
export async function appointmentVisitId(appointmentId: string): Promise<string | null> {
  const t = await db.stateTransition.findFirst({
    where: { entityType: "Appointment", entityId: appointmentId, event: "check_in" },
    orderBy: { createdAt: "desc" },
  });
  const meta = t?.meta as { visitId?: string } | null;
  return meta?.visitId ?? null;
}
