"use server";
import { z } from "zod";
import { requireRole } from "@/server/session";
import { FsmError, type StockRequestEvent } from "@/server/fsm";
import { createStockRequest, transitionStockRequest } from "@/server/services/store";

export interface ActionResult {
  ok: boolean;
  error?: string;
  to?: string;
}

const schema = z.object({
  itemName: z.string().trim().min(2, "Item name is required"),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
  reason: z.string().trim().optional(),
});

export async function createStockRequestAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const actor = await requireRole("STORE_KEEPER", "MANAGER", "NURSE", "PHARMACIST", "LAB_TECH", "HR", "RECEPTIONIST", "DOCTOR");
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid data" };
  try {
    await createStockRequest(
      { itemName: parsed.data.itemName, quantity: parsed.data.quantity, reason: parsed.data.reason },
      actor,
    );
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not submit the request." };
  }
}

export async function advanceStockRequestAction(
  id: string,
  event: StockRequestEvent,
): Promise<ActionResult> {
  const actor = await requireRole("STORE_KEEPER", "MANAGER");
  try {
    const { to } = await transitionStockRequest(id, event, actor);
    return { ok: true, to };
  } catch (err) {
    if (err instanceof FsmError) return { ok: false, error: err.message };
    return { ok: false, error: err instanceof Error ? err.message : "Action failed" };
  }
}
