"use server";
import { z } from "zod";
import { requireRole } from "@/server/session";
import { upsertShift, deleteShift, parseDay } from "@/server/services/hr-ops";

export type RosterActionState = { error?: string; ok?: boolean };

const upsertSchema = z
  .object({
    userId: z.string().min(1),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, "Enter a start time"),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, "Enter an end time"),
    area: z.string().trim().max(120).optional(),
    note: z.string().trim().max(500).optional(),
  })
  .refine((d) => d.endTime > d.startTime, {
    message: "End time must be after the start time",
    path: ["endTime"],
  });

export async function upsertShiftAction(
  _prev: RosterActionState,
  formData: FormData,
): Promise<RosterActionState> {
  const actor = await requireRole("HR", "MANAGER");

  const parsed = upsertSchema.safeParse({
    userId: formData.get("userId"),
    date: formData.get("date"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
    area: formData.get("area") || undefined,
    note: formData.get("note") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid request." };
  }

  const { userId, date, startTime, endTime, area, note } = parsed.data;
  try {
    await upsertShift({ userId, date: parseDay(date), startTime, endTime, area, note }, actor);
    return { ok: true };
  } catch {
    return { error: "Could not save the shift." };
  }
}

const deleteSchema = z.object({ id: z.string().min(1) });

export async function deleteShiftAction(
  _prev: RosterActionState,
  formData: FormData,
): Promise<RosterActionState> {
  const actor = await requireRole("HR", "MANAGER");

  const parsed = deleteSchema.safeParse({ id: formData.get("id") });
  if (!parsed.success) return { error: "Invalid request." };

  try {
    await deleteShift(parsed.data.id, actor);
    return { ok: true };
  } catch {
    return { error: "Could not remove the shift." };
  }
}
