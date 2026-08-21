"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireRole } from "@/server/session";
import {
  addMedication,
  receiveStockBatch,
  toggleMedicationActive,
  updateMedication,
} from "@/server/services/inventory";

export interface FormState {
  ok?: boolean;
  error?: string;
  id?: string;
}

const medicationSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  strength: z.string().trim().optional(),
  form: z.string().trim().optional(),
  category: z.string().trim().optional(),
  unit: z.string().trim().optional(),
  reorderLevel: z.coerce.number().int().min(0, "Reorder level cannot be negative").optional(),
});

/** Create a medication, then redirect to its detail page. Used by /new and the list dialog. */
export async function createMedicationAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const actor = await requireRole("PHARMACIST");
  const parsed = medicationSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid data" };

  let id: string;
  try {
    const med = await addMedication(parsed.data, actor);
    id = med.id;
  } catch (err) {
    return {
      error:
        err instanceof Error && /unique/i.test(err.message)
          ? "A medicine with this name, strength and form already exists."
          : "Could not add the medicine.",
    };
  }
  redirect(`/pharmacy/inventory/${id}`);
}

const editSchema = medicationSchema.extend({ id: z.string().min(1) });

export async function updateMedicationAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const actor = await requireRole("PHARMACIST");
  const parsed = editSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid data" };
  const { id, ...data } = parsed.data;
  try {
    await updateMedication(id, data, actor);
    return { ok: true, id };
  } catch {
    return { error: "Could not update the medicine." };
  }
}

const receiveSchema = z.object({
  medicationId: z.string().min(1, "Choose a medicine"),
  batchNo: z.string().trim().min(1, "Batch number is required"),
  expiryDate: z.coerce.date({ message: "Enter a valid expiry date" }),
  quantity: z.coerce.number().int().positive("Quantity must be greater than zero"),
  costPrice: z.coerce.number().min(0).optional(),
  sellPrice: z.coerce.number().min(0).optional(),
  supplierId: z.string().trim().optional(),
});

/** Receive a stock batch. Works from the list page (medicationId picked) and the detail page (hidden). */
export async function receiveStockAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const actor = await requireRole("PHARMACIST");
  const parsed = receiveSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid data" };
  const d = parsed.data;
  try {
    await receiveStockBatch(
      {
        medicationId: d.medicationId,
        batchNo: d.batchNo,
        expiryDate: d.expiryDate,
        quantity: d.quantity,
        costPrice: d.costPrice,
        sellPrice: d.sellPrice,
        supplierId: d.supplierId || null,
      },
      actor,
    );
    return { ok: true, id: d.medicationId };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not receive stock." };
  }
}

export async function toggleMedicationActiveAction(id: string): Promise<FormState> {
  const actor = await requireRole("PHARMACIST");
  try {
    const med = await toggleMedicationActive(id, actor);
    return { ok: true, id: med.id };
  } catch {
    return { error: "Could not update status." };
  }
}
