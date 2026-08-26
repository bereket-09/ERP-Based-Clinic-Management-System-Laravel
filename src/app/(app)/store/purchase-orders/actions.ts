"use server";
import { z } from "zod";
import { requireRole } from "@/server/session";
import {
  createPurchaseOrder,
  receivePurchaseOrder,
  cancelPurchaseOrder,
} from "@/server/services/store";

export interface ActionResult {
  ok: boolean;
  error?: string;
  to?: string;
}

export interface CreatePOResult extends ActionResult {
  id?: string;
}

const itemSchema = z.object({
  itemName: z.string().trim().min(1),
  quantity: z.coerce.number().int().min(1),
  unitPrice: z.coerce.number().min(0),
  medicationId: z.string().trim().optional().nullable(),
});

const createSchema = z.object({
  supplierId: z.string().trim().optional().nullable(),
  note: z.string().trim().optional().nullable(),
  items: z.array(itemSchema).min(1, "Add at least one line item"),
});

export async function createPurchaseOrderAction(input: {
  supplierId?: string | null;
  note?: string | null;
  items: { itemName: string; quantity: number; unitPrice: number; medicationId?: string | null }[];
}): Promise<CreatePOResult> {
  const actor = await requireRole("STORE_KEEPER", "MANAGER");
  const parsed = createSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid data" };
  try {
    const po = await createPurchaseOrder(
      {
        supplierId: parsed.data.supplierId || null,
        note: parsed.data.note || null,
        items: parsed.data.items.map((i) => ({
          itemName: i.itemName,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          medicationId: i.medicationId || null,
        })),
      },
      actor,
    );
    return { ok: true, id: po.id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Could not create the purchase order." };
  }
}

export async function receivePurchaseOrderAction(
  id: string,
  receipts: { itemId: string; quantity: number }[],
): Promise<ActionResult> {
  const actor = await requireRole("STORE_KEEPER", "MANAGER");
  try {
    const { to } = await receivePurchaseOrder(id, receipts, actor);
    return { ok: true, to };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Could not receive stock." };
  }
}

export async function cancelPurchaseOrderAction(id: string, reason?: string): Promise<ActionResult> {
  const actor = await requireRole("STORE_KEEPER", "MANAGER");
  try {
    const { to } = await cancelPurchaseOrder(id, reason, actor);
    return { ok: true, to };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Could not cancel the order." };
  }
}
