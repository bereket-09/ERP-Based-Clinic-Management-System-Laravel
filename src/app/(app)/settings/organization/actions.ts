"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/server/session";
import { db } from "@/server/db";
import { audit } from "@/server/services/events";

const schema = z.object({
  name: z.string().trim().min(2),
  kind: z.enum(["CLINICAL", "ACADEMIC", "ADMIN"]),
  code: z.string().trim().optional(),
});

export async function addDepartmentAction(_prev: { error?: string }, formData: FormData) {
  const actor = await requireRole("MANAGER");
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Enter a department name" };
  try {
    const d = await db.department.create({ data: parsed.data });
    await audit(actor.id, "department.create", "Department", d.id, parsed.data);
    revalidatePath("/settings/organization");
    return {};
  } catch {
    return { error: "A department with that name already exists" };
  }
}
