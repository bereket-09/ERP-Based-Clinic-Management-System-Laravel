"use server";
import { requireRole } from "@/server/session";
import { FsmError } from "@/server/fsm";
import { dispenseOrder, cancelDrugOrder, type DispenseInput } from "@/server/services/pharmacy";

export interface ActionResult {
  ok: boolean;
  error?: string;
}

export async function dispenseAction(orderId: string, dispenses: DispenseInput[]): Promise<ActionResult> {
  const actor = await requireRole("PHARMACIST");
  try {
    await dispenseOrder(orderId, dispenses, actor);
    return { ok: true };
  } catch (err) {
    if (err instanceof FsmError) return { ok: false, error: err.message };
    return { ok: false, error: err instanceof Error ? err.message : "Dispense failed" };
  }
}

export async function cancelOrderAction(orderId: string, reason?: string): Promise<ActionResult> {
  const actor = await requireRole("PHARMACIST");
  try {
    await cancelDrugOrder(orderId, actor, reason);
    return { ok: true };
  } catch (err) {
    if (err instanceof FsmError) return { ok: false, error: err.message };
    return { ok: false, error: "Cancel failed" };
  }
}
