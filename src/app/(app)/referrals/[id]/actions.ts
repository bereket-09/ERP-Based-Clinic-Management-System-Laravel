"use server";
import { requireRole } from "@/server/session";
import { FsmError, type ReferralEvent } from "@/server/fsm";
import { transitionReferral } from "@/server/services/referral";

export interface ActionResult {
  ok: boolean;
  error?: string;
}

export async function referralTransition(
  id: string,
  event: ReferralEvent,
  reason?: string,
): Promise<ActionResult> {
  const actor = await requireRole("DOCTOR", "RECEPTIONIST");
  try {
    await transitionReferral(id, event, actor, reason);
    return { ok: true };
  } catch (err) {
    if (err instanceof FsmError) return { ok: false, error: err.message };
    return { ok: false, error: err instanceof Error ? err.message : "Action failed" };
  }
}
