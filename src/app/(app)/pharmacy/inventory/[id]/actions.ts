"use server";
import { z } from "zod";
import { requireRole } from "@/server/session";
import { adjustBatch } from "@/server/services/inventory";
import type { FormState } from "../actions";

const adjustSchema = z.object({
  batchId: z.string().min(1, "Choose a batch"),
  type: z.enum(["ADJUST_UP", "ADJUST_DOWN", "EXPIRE"]),
  quantity: z.coerce.number().int().positive("Quantity must be greater than zero"),
  reason: z.string().trim().min(3, "A reason is required"),
});

export async function adjustStockAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const actor = await requireRole("PHARMACIST");
  const parsed = adjustSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid data" };
  const d = parsed.data;
  try {
    const { medicationId } = await adjustBatch(
      { batchId: d.batchId, type: d.type, quantity: d.quantity, reason: d.reason },
      actor,
    );
    return { ok: true, id: medicationId };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not adjust stock." };
  }
}
