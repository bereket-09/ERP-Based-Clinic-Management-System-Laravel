"use server";
import { requireRole } from "@/server/session";
import { FsmError, type LabOrderEvent } from "@/server/fsm";
import { transitionLabOrder, type LabResultInput } from "@/server/services/lab";

export interface ActionResult {
  ok: boolean;
  error?: string;
}

export async function labTransition(
  orderId: string,
  event: LabOrderEvent,
  payload: { results?: LabResultInput[]; reason?: string } = {},
): Promise<ActionResult> {
  const actor = await requireRole("LAB_TECH");
  try {
    await transitionLabOrder(orderId, event, actor, payload);
    return { ok: true };
  } catch (err) {
    if (err instanceof FsmError) return { ok: false, error: err.message };
    return { ok: false, error: err instanceof Error ? err.message : "Action failed" };
  }
}
