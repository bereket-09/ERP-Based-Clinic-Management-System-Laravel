"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireStudent } from "@/server/session";
import { db } from "@/server/db";

export type RequestState = { ok?: boolean; error?: string };

const schema = z.object({
  reason: z.string().trim().min(5, "Please describe your request in a little more detail.").max(1000),
  date: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? v : undefined)),
});

export async function submitRequest(
  _prev: RequestState,
  formData: FormData,
): Promise<RequestState> {
  const actor = await requireStudent();

  const parsed = schema.safeParse({
    reason: String(formData.get("reason") ?? ""),
    date: String(formData.get("date") ?? ""),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid request." };
  }

  const { reason, date } = parsed.data;
  const patient = await db.patient.findUnique({ where: { id: actor.id } });

  const who = patient ? `${patient.name} (${patient.mrn}${patient.studentId ? `, ${patient.studentId}` : ""})` : actor.name;
  const body = [
    `Student request from ${who}.`,
    date ? `Preferred date: ${date}.` : null,
    `Reason: ${reason}`,
  ]
    .filter(Boolean)
    .join(" ");

  // Notify reception (broadcast to the RECEPTIONIST role).
  // NOTE: Notification.recipientId is a FK to User.id, while actor.id is a
  // Patient.id — so we cannot persist a student-owned copy here. We surface a
  // confirmation to the student instead of tracking a per-student record.
  await db.notification.create({
    data: {
      type: "GENERIC",
      title: "Student request",
      body,
      link: "/patients",
      recipientRole: "RECEPTIONIST",
    },
  });

  revalidatePath("/portal/requests");
  return { ok: true };
}
