"use server";
import { requireStaff } from "@/server/session";
import { FsmError, type VisitEvent } from "@/server/fsm";
import { transitionVisit, saveConsultation, type TransitionPayload } from "@/server/services/visit";

export interface ActionResult {
  ok: boolean;
  error?: string;
  to?: string;
}

/** Advance a visit through a validated FSM transition (used by the workspace UI). */
export async function advanceVisit(
  visitId: string,
  event: VisitEvent,
  payload: TransitionPayload = {},
): Promise<ActionResult> {
  const actor = await requireStaff();
  try {
    const { to } = await transitionVisit(visitId, event, actor, payload);
    return { ok: true, to };
  } catch (err) {
    if (err instanceof FsmError) return { ok: false, error: err.message };
    return { ok: false, error: err instanceof Error ? err.message : "Action failed" };
  }
}

export async function saveConsultationAction(
  visitId: string,
  data: TransitionPayload["diagnosis"],
): Promise<ActionResult> {
  const actor = await requireStaff();
  try {
    await saveConsultation(visitId, data, actor);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Save failed" };
  }
}
