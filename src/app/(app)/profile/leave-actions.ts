"use server";
import { z } from "zod";
import { requireStaff } from "@/server/session";
import { db } from "@/server/db";
import { createLeaveRequest, transitionLeave } from "@/server/services/hr";
import { FsmError } from "@/server/fsm";

export type LeaveFormState = { error?: string; ok?: boolean };

const LEAVE_TYPES = [
  "SICK",
  "ANNUAL",
  "MATERNITY",
  "PATERNITY",
  "UNPAID",
  "BEREAVEMENT",
  "STUDY",
] as const;

const requestSchema = z
  .object({
    type: z.enum(LEAVE_TYPES),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    reason: z.string().trim().max(1000).optional(),
  })
  .refine((d) => d.endDate >= d.startDate, {
    message: "End date must be on or after the start date",
    path: ["endDate"],
  });

/** Submit a leave request for the CURRENT staff member. */
export async function requestLeaveAction(
  _prev: LeaveFormState,
  formData: FormData,
): Promise<LeaveFormState> {
  const actor = await requireStaff();

  const parsed = requestSchema.safeParse({
    type: formData.get("type"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    reason: formData.get("reason") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid request." };
  }

  try {
    await createLeaveRequest({ employeeId: actor.id, ...parsed.data });
    return { ok: true };
  } catch {
    return { error: "Could not submit the leave request." };
  }
}

const cancelSchema = z.object({ leaveId: z.string().min(1) });

/** Cancel one of the current staff member's own pending/approved requests. */
export async function cancelLeaveAction(
  _prev: LeaveFormState,
  formData: FormData,
): Promise<LeaveFormState> {
  const actor = await requireStaff();

  const parsed = cancelSchema.safeParse({ leaveId: formData.get("leaveId") });
  if (!parsed.success) return { error: "Invalid request." };

  // Ownership check — a staff member may only cancel their own request.
  const leave = await db.leaveRequest.findUnique({
    where: { id: parsed.data.leaveId },
    select: { employeeId: true },
  });
  if (!leave || leave.employeeId !== actor.id) {
    return { error: "Leave request not found." };
  }

  try {
    await transitionLeave(parsed.data.leaveId, "cancel", actor);
    return { ok: true };
  } catch (err) {
    if (err instanceof FsmError) return { error: err.message };
    return { error: "Could not cancel the leave request." };
  }
}
