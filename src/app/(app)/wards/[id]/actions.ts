"use server";
import { requireRole } from "@/server/session";
import { FsmError, type AdmissionEvent } from "@/server/fsm";
import {
  transitionAdmission,
  transferBed,
  type AdmissionTransitionPayload,
} from "@/server/services/ward";

export interface ActionResult {
  ok: boolean;
  error?: string;
  to?: string;
}

/** Advance an admission through a validated FSM transition (used by the ward detail UI). */
export async function advanceAdmission(
  admissionId: string,
  event: AdmissionEvent,
  payload: AdmissionTransitionPayload = {},
): Promise<ActionResult> {
  const actor = await requireRole("NURSE", "DOCTOR");
  try {
    const { to } = await transitionAdmission(admissionId, event, actor, payload);
    return { ok: true, to };
  } catch (err) {
    if (err instanceof FsmError) return { ok: false, error: err.message };
    return { ok: false, error: err instanceof Error ? err.message : "Action failed" };
  }
}

/** Move an admitted patient to a different bed. */
export async function moveBed(admissionId: string, newBedId: string): Promise<ActionResult> {
  const actor = await requireRole("NURSE", "DOCTOR");
  try {
    await transferBed(admissionId, newBedId, actor);
    return { ok: true };
  } catch (err) {
    if (err instanceof FsmError) return { ok: false, error: err.message };
    return { ok: false, error: err instanceof Error ? err.message : "Transfer failed" };
  }
}
