"use server";
import { requireRole } from "@/server/session";
import { FsmError, type AppointmentEvent } from "@/server/fsm";
import {
  transitionAppointment,
  type AppointmentTransitionPayload,
} from "@/server/services/appointment";

export interface ActionResult {
  ok: boolean;
  error?: string;
  to?: string;
  visitId?: string;
}

/** Advance an appointment through a validated FSM transition. */
export async function advanceAppointment(
  appointmentId: string,
  event: AppointmentEvent,
  payload: AppointmentTransitionPayload = {},
): Promise<ActionResult> {
  const actor = await requireRole("RECEPTIONIST", "DOCTOR", "NURSE");
  try {
    const { to, visitId } = await transitionAppointment(appointmentId, event, actor, payload);
    return { ok: true, to, visitId };
  } catch (err) {
    if (err instanceof FsmError) return { ok: false, error: err.message };
    return { ok: false, error: err instanceof Error ? err.message : "Action failed" };
  }
}
