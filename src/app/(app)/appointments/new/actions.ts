"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireRole } from "@/server/session";
import { createAppointment } from "@/server/services/appointment";

export interface BookState {
  error?: string;
}

const bookSchema = z.object({
  patientId: z.string().min(1, "Select a patient"),
  providerId: z.string().trim().optional(),
  scheduledFor: z.string().min(1, "Pick a date and time"),
  durationMin: z.coerce.number().int().positive().max(480).optional(),
  reason: z.string().trim().optional(),
});

export async function bookAppointment(_prev: BookState, formData: FormData): Promise<BookState> {
  const actor = await requireRole("RECEPTIONIST", "DOCTOR", "NURSE");
  const parsed = bookSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid data" };
  const d = parsed.data;

  const when = new Date(d.scheduledFor);
  if (Number.isNaN(when.getTime())) return { error: "Invalid date and time" };

  await createAppointment(
    {
      patientId: d.patientId,
      providerId: d.providerId || undefined,
      scheduledFor: when,
      durationMin: d.durationMin,
      reason: d.reason,
    },
    actor,
  );

  redirect("/appointments");
}
