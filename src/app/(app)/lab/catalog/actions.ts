"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/server/db";
import { requireRole } from "@/server/session";

export interface LabTestFormState {
  ok?: boolean;
  error?: string;
}

const num = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? undefined : v),
  z.coerce.number().min(0).optional(),
);

const schema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  category: z.string().trim().optional(),
  specimen: z.string().trim().optional(),
  unit: z.string().trim().optional(),
  refRangeLow: num,
  refRangeHigh: num,
  refRangeText: z.string().trim().optional(),
  price: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? 0 : v),
    z.coerce.number().min(0, "Price cannot be negative"),
  ),
});

export async function saveLabTestAction(
  _prev: LabTestFormState,
  formData: FormData,
): Promise<LabTestFormState> {
  await requireRole("LAB_TECH");
  const id = String(formData.get("id") ?? "").trim();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid data" };
  const d = parsed.data;
  const data = {
    name: d.name,
    category: d.category || null,
    specimen: d.specimen || null,
    unit: d.unit || null,
    refRangeLow: d.refRangeLow ?? null,
    refRangeHigh: d.refRangeHigh ?? null,
    refRangeText: d.refRangeText || null,
    price: d.price,
  };
  try {
    if (id) await db.labTest.update({ where: { id }, data });
    else await db.labTest.create({ data });
    revalidatePath("/lab/catalog");
    return { ok: true };
  } catch (err) {
    return {
      error:
        err instanceof Error && /unique/i.test(err.message)
          ? "A test with this name already exists."
          : "Could not save the test.",
    };
  }
}

export async function toggleLabTestActiveAction(id: string): Promise<LabTestFormState> {
  await requireRole("LAB_TECH");
  try {
    const current = await db.labTest.findUniqueOrThrow({ where: { id }, select: { isActive: true } });
    await db.labTest.update({ where: { id }, data: { isActive: !current.isActive } });
    revalidatePath("/lab/catalog");
    return { ok: true };
  } catch {
    return { error: "Could not update status." };
  }
}
