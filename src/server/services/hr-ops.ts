import "server-only";
import { revalidatePath } from "next/cache";
import type { AttendanceStatus, LeaveType } from "@prisma/client";
import { db } from "@/server/db";
import type { Actor } from "@/server/session";
import { audit } from "./events";

// ─────────────────────────────────────────────────────────────────────────────
// Date helpers — attendance/shift dates are stored at UTC midnight so the
// @@unique([userId, date]) constraint and range queries behave consistently.
// ─────────────────────────────────────────────────────────────────────────────

/** Normalise any Date to UTC midnight of its calendar day. */
export function dayStart(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

/** Parse a `yyyy-MM-dd` param into a UTC-midnight Date (falls back to today). */
export function parseDay(param?: string | null): Date {
  if (param && /^\d{4}-\d{2}-\d{2}$/.test(param)) {
    const d = new Date(`${param}T00:00:00.000Z`);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return dayStart(new Date());
}

/** Format a Date as a `yyyy-MM-dd` param using its UTC calendar day. */
export function toDayParam(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** UTC-safe Monday of the week containing `d`. */
export function weekStartOf(d: Date): Date {
  const base = dayStart(d);
  const day = base.getUTCDay(); // 0 = Sun … 6 = Sat
  const diff = day === 0 ? -6 : 1 - day;
  return new Date(base.getTime() + diff * 86_400_000);
}

/** The 7 UTC-midnight days of the week starting at `start`. */
export function weekDays(start: Date): Date[] {
  const s = dayStart(start);
  return Array.from({ length: 7 }, (_, i) => new Date(s.getTime() + i * 86_400_000));
}

function revalidateHr() {
  revalidatePath("/hr/attendance");
  revalidatePath("/hr/roster");
  revalidatePath("/hr/leave-balances");
  revalidatePath("/hr");
}

// ─────────────────────────────────────────────────────────────────────────────
// Attendance
// ─────────────────────────────────────────────────────────────────────────────

export interface AttendanceInput {
  status: AttendanceStatus;
  clockIn?: Date | null;
  clockOut?: Date | null;
  note?: string | null;
}

/** Upsert a staff member's attendance record for a given day. */
export async function markAttendance(
  userId: string,
  date: Date,
  input: AttendanceInput,
  actor: Actor,
) {
  const day = dayStart(date);
  const record = await db.attendance.upsert({
    where: { userId_date: { userId, date: day } },
    create: {
      userId,
      date: day,
      status: input.status,
      clockIn: input.clockIn ?? null,
      clockOut: input.clockOut ?? null,
      note: input.note ?? null,
    },
    update: {
      status: input.status,
      ...(input.clockIn !== undefined ? { clockIn: input.clockIn } : {}),
      ...(input.clockOut !== undefined ? { clockOut: input.clockOut } : {}),
      ...(input.note !== undefined ? { note: input.note } : {}),
    },
  });

  await audit(actor.id, "attendance.mark", "Attendance", record.id, {
    userId,
    date: toDayParam(day),
    status: input.status,
  });

  revalidateHr();
  return record;
}

/**
 * Clock a staff member in or out for today. Sets clockIn on the first tap
 * (creating the record as PRESENT if needed) and clockOut on the next.
 */
export async function clockInOut(userId: string, actor: Actor) {
  const day = dayStart(new Date());
  const now = new Date();
  const existing = await db.attendance.findUnique({
    where: { userId_date: { userId, date: day } },
  });

  let action: "clock_in" | "clock_out";
  let record;

  if (!existing) {
    action = "clock_in";
    record = await db.attendance.create({
      data: { userId, date: day, status: "PRESENT", clockIn: now },
    });
  } else if (!existing.clockIn) {
    action = "clock_in";
    record = await db.attendance.update({
      where: { id: existing.id },
      data: { clockIn: now },
    });
  } else {
    action = "clock_out";
    record = await db.attendance.update({
      where: { id: existing.id },
      data: { clockOut: now },
    });
  }

  await audit(actor.id, `attendance.${action}`, "Attendance", record.id, {
    userId,
    date: toDayParam(day),
  });

  revalidateHr();
  return record;
}

/** All attendance records for a given day. */
export async function attendanceForDate(date: Date) {
  return db.attendance.findMany({
    where: { date: dayStart(date) },
    include: { user: true },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Shift roster
// ─────────────────────────────────────────────────────────────────────────────

export interface ShiftInput {
  userId: string;
  date: Date;
  startTime: string;
  endTime: string;
  area?: string | null;
  note?: string | null;
}

/** Create or update the shift for a given staff member on a given day. */
export async function upsertShift(input: ShiftInput, actor: Actor) {
  const day = dayStart(input.date);
  const existing = await db.shift.findFirst({
    where: { userId: input.userId, date: day },
  });

  const data = {
    userId: input.userId,
    date: day,
    startTime: input.startTime,
    endTime: input.endTime,
    area: input.area ?? null,
    note: input.note ?? null,
  };

  const record = existing
    ? await db.shift.update({ where: { id: existing.id }, data })
    : await db.shift.create({ data });

  await audit(actor.id, existing ? "shift.update" : "shift.create", "Shift", record.id, {
    userId: input.userId,
    date: toDayParam(day),
    startTime: input.startTime,
    endTime: input.endTime,
  });

  revalidateHr();
  return record;
}

/** Remove a shift. */
export async function deleteShift(id: string, actor: Actor) {
  const record = await db.shift.delete({ where: { id } });
  await audit(actor.id, "shift.delete", "Shift", id, {
    userId: record.userId,
    date: toDayParam(record.date),
  });
  revalidateHr();
  return record;
}

/** All shifts within the 7-day week starting at `startDate`. */
export async function shiftsForWeek(startDate: Date) {
  const start = dayStart(startDate);
  const end = new Date(start.getTime() + 7 * 86_400_000);
  return db.shift.findMany({
    where: { date: { gte: start, lt: end } },
    include: { user: true },
    orderBy: { startTime: "asc" },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Leave balances
// ─────────────────────────────────────────────────────────────────────────────

export interface LeaveBalanceInput {
  userId: string;
  type: LeaveType;
  year: number;
  entitled: number;
}

/** Set a staff member's entitlement for a leave type in a given year. */
export async function setLeaveBalance(input: LeaveBalanceInput, actor: Actor) {
  const record = await db.leaveBalance.upsert({
    where: {
      userId_type_year: { userId: input.userId, type: input.type, year: input.year },
    },
    create: {
      userId: input.userId,
      type: input.type,
      year: input.year,
      entitled: input.entitled,
    },
    update: { entitled: input.entitled },
  });

  await audit(actor.id, "leaveBalance.set", "LeaveBalance", record.id, {
    userId: input.userId,
    type: input.type,
    year: input.year,
    entitled: input.entitled,
  });

  revalidateHr();
  return record;
}

/** All leave balances for a given year. */
export async function leaveBalancesFor(year: number) {
  return db.leaveBalance.findMany({
    where: { year },
    include: { user: true },
  });
}
