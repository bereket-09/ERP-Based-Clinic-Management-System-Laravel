"use server";
import { z } from "zod";
import { requireRole } from "@/server/session";
import { markAttendance, clockInOut, parseDay } from "@/server/services/hr-ops";

export type AttendanceActionState = { error?: string; ok?: boolean };

const markSchema = z.object({
  userId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.enum(["PRESENT", "ABSENT", "LATE", "ON_LEAVE", "HALF_DAY"]),
  note: z.string().trim().max(500).optional(),
});

export async function markAttendanceAction(
  _prev: AttendanceActionState,
  formData: FormData,
): Promise<AttendanceActionState> {
  const actor = await requireRole("HR", "MANAGER");

  const parsed = markSchema.safeParse({
    userId: formData.get("userId"),
    date: formData.get("date"),
    status: formData.get("status"),
    note: formData.get("note") || undefined,
  });
  if (!parsed.success) return { error: "Invalid request." };

  const { userId, date, status, note } = parsed.data;
  try {
    await markAttendance(userId, parseDay(date), { status, note }, actor);
    return { ok: true };
  } catch {
    return { error: "Could not update attendance." };
  }
}

const clockSchema = z.object({ userId: z.string().min(1) });

export async function clockInOutAction(
  _prev: AttendanceActionState,
  formData: FormData,
): Promise<AttendanceActionState> {
  const actor = await requireRole("HR", "MANAGER");

  const parsed = clockSchema.safeParse({ userId: formData.get("userId") });
  if (!parsed.success) return { error: "Invalid request." };

  try {
    await clockInOut(parsed.data.userId, actor);
    return { ok: true };
  } catch {
    return { error: "Could not record the clock event." };
  }
}
