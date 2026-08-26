"use server";
import { z } from "zod";
import type { AssetAssignmentState } from "@prisma/client";
import { requireRole } from "@/server/session";
import { addAsset, updateAsset, assignAsset, returnAsset } from "@/server/services/store";

export interface ActionResult {
  ok: boolean;
  error?: string;
}

const assetSchema = z.object({
  tag: z.string().trim().min(2, "Asset tag is required"),
  name: z.string().trim().min(2, "Name is required"),
  category: z.string().trim().optional(),
  serialNo: z.string().trim().optional(),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
  unitPrice: z.coerce.number().min(0, "Price cannot be negative"),
  receiptNo: z.string().trim().optional(),
});

export async function saveAssetAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const actor = await requireRole("STORE_KEEPER", "MANAGER");
  const id = String(formData.get("id") ?? "").trim();
  const parsed = assetSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid data" };
  const data = {
    tag: parsed.data.tag,
    name: parsed.data.name,
    category: parsed.data.category || null,
    serialNo: parsed.data.serialNo || null,
    quantity: parsed.data.quantity,
    unitPrice: parsed.data.unitPrice,
    receiptNo: parsed.data.receiptNo || null,
  };
  try {
    if (id) await updateAsset(id, data, actor);
    else await addAsset(data, actor);
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof Error && /unique/i.test(err.message)
          ? "An asset with this tag already exists."
          : "Could not save the asset.",
    };
  }
}

export async function assignAssetAction(input: {
  assetId: string;
  userId: string;
  quantity: number;
}): Promise<ActionResult> {
  const actor = await requireRole("STORE_KEEPER", "MANAGER");
  if (!input.userId) return { ok: false, error: "Select a staff member" };
  try {
    await assignAsset(input, actor);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Could not assign the asset." };
  }
}

export async function returnAssetAction(
  assignmentId: string,
  state: Extract<AssetAssignmentState, "RETURNED" | "LOST" | "DAMAGED">,
): Promise<ActionResult> {
  const actor = await requireRole("STORE_KEEPER", "MANAGER");
  try {
    await returnAsset(assignmentId, state, actor);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Could not update the assignment." };
  }
}
