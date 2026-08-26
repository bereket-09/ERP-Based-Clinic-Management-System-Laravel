"use server";
import { z } from "zod";
import { requireRole } from "@/server/session";
import { transitionLeave, createLeaveRequest, type LeavePayload } from "@/server/services/hr";
import { FsmError } from "@/server/fsm";
import type { LeaveEvent } from "@/server/fsm";

export type LeaveActionState = { error?: string; ok?: boolean };

const transitionSchema = z.object({
  leaveId: z.string().min(1),
  event: z.enum([
    "approve",
    "reject",
    "activate",
    "request_return",
    "approve_return",
    "cancel",
  ]),
  decisionComment: z.string().trim().max(500).optional(),
});

export async function transitionLeaveAction(
  _prev: LeaveActionState,
  formData: FormData,
): Promise<LeaveActionState> {
  const actor = await requireRole("HR");

  const parsed = transitionSchema.safeParse({
    leaveId: formData.get("leaveId"),
    event: formData.get("event"),
    decisionComment: formData.get("decisionComment") || undefined,
  });
  if (!parsed.success) return { error: "Invalid request." };

  const { leaveId, event, decisionComment } = parsed.data;
  const payload: LeavePayload = { decisionComment };

  try {
    await transitionLeave(leaveId, event as LeaveEvent, actor, payload);
    return { ok: true };
  } catch (err) {
    if (err instanceof FsmError) return { error: err.message };
    return { error: "Could not update the leave request." };
  }
}

const createSchema = z
  .object({
    employeeId: z.string().min(1, "Select an employee"),
    type: z.enum(["SICK", "ANNUAL", "MATERNITY", "PATERNITY", "UNPAID", "BEREAVEMENT", "STUDY"]),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    reason: z.string().trim().max(1000).optional(),
  })
  .refine((d) => d.endDate >= d.startDate, {
    message: "End date must be on or after the start date",
    path: ["endDate"],
  });

export async function createLeaveAction(
  _prev: LeaveActionState,
  formData: FormData,
): Promise<LeaveActionState> {
  await requireRole("HR");

  const parsed = createSchema.safeParse({
    employeeId: formData.get("employeeId"),
    type: formData.get("type"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    reason: formData.get("reason") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid request." };
  }

  try {
    await createLeaveRequest(parsed.data);
    return { ok: true };
  } catch {
    return { error: "Could not create the leave request." };
  }
}
