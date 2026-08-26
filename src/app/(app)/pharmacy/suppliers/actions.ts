"use server";
import { z } from "zod";
import { requireRole } from "@/server/session";
import { addSupplier, updateSupplier } from "@/server/services/inventory";

export interface SupplierFormState {
  ok?: boolean;
  error?: string;
}

const schema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  phone: z.string().trim().optional(),
  email: z.string().trim().email("Enter a valid email").optional().or(z.literal("")),
  address: z.string().trim().optional(),
});

export async function saveSupplierAction(
  _prev: SupplierFormState,
  formData: FormData,
): Promise<SupplierFormState> {
  const actor = await requireRole("PHARMACIST");
  const id = String(formData.get("id") ?? "").trim();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid data" };
  const data = {
    name: parsed.data.name,
    phone: parsed.data.phone || null,
    email: parsed.data.email || null,
    address: parsed.data.address || null,
  };
  try {
    if (id) await updateSupplier(id, data, actor);
    else await addSupplier(data, actor);
    return { ok: true };
  } catch (err) {
    return {
      error:
        err instanceof Error && /unique/i.test(err.message)
          ? "A supplier with this name already exists."
          : "Could not save the supplier.",
    };
  }
}
