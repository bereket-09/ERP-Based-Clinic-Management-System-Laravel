import "server-only";
import { revalidatePath } from "next/cache";
import type { LeaveType } from "@prisma/client";
import { db } from "@/server/db";
import {
  resolveTransition,
  availableTransitions,
  leaveMachine,
  type LeaveEvent,
} from "@/server/fsm";
import type { Actor } from "@/server/session";
import { logTransition, notifyRole, notifyUser } from "./events";

export interface LeavePayload {
  /** Approver note stored on approve/reject. */
  decisionComment?: string;
  /** Optional free-text note recorded on the transition. */
  reason?: string;
}

/** Affordances (available actions) for a leave request given the actor's role. */
export function leaveAffordances(state: string, actor: Actor) {
  return availableTransitions(leaveMachine, state as never, { role: actor.role });
}

/**
 * The single entry point for advancing a leave request. Validates the transition
 * through the FSM (state + role), applies the event's side-effects atomically
 * (crucially the employee's employmentStatus lock), records the transition, and
 * notifies the employee.
 */
export async function transitionLeave(
  leaveId: string,
  event: LeaveEvent,
  actor: Actor,
  payload: LeavePayload = {},
) {
  const leave = await db.leaveRequest.findUnique({ where: { id: leaveId } });
  if (!leave) throw new Error("Leave request not found");

  // FSM gate — throws FsmError if illegal or unauthorized.
  const { to } = resolveTransition(leaveMachine, leave.state, event, { role: actor.role });

  const wasActive = leave.state === "ACTIVE";

  await db.$transaction(async (tx) => {
    switch (event) {
      case "approve":
      case "reject": {
        await tx.leaveRequest.update({
          where: { id: leaveId },
          data: { approverId: actor.id, decisionComment: payload.decisionComment },
        });
        break;
      }
      case "activate": {
        // Employee is now on leave → lock their login.
        await tx.user.update({
          where: { id: leave.employeeId },
          data: { employmentStatus: "ON_LEAVE" },
        });
        break;
      }
      case "approve_return": {
        await tx.leaveRequest.update({
          where: { id: leaveId },
          data: { returnedAt: new Date() },
        });
        break;
      }
      default:
        break;
    }

    // Whenever an ACTIVE leave ends, restore the employee to ACTIVE employment.
    if (wasActive && (event === "approve_return" || event === "cancel" || event === "reject")) {
      await tx.user.update({
        where: { id: leave.employeeId },
        data: { employmentStatus: "ACTIVE" },
      });
    }

    await tx.leaveRequest.update({ where: { id: leaveId }, data: { state: to } });

    await logTransition(tx, {
      entityType: "LeaveRequest",
      entityId: leaveId,
      event,
      from: leave.state,
      to,
      actorId: actor.id,
      note: payload.decisionComment ?? payload.reason,
    });

    // Keep the employee in the loop on decisions.
    if (event === "approve" || event === "reject" || event === "approve_return") {
      const title =
        event === "approve"
          ? "Leave request approved"
          : event === "reject"
            ? "Leave request rejected"
            : "Return approved";
      await notifyUser(tx, leave.employeeId, {
        type: "LEAVE_DECISION",
        title,
        body: payload.decisionComment ?? undefined,
        link: "/hr/leave",
      });
    }
  });

  revalidatePath("/hr/leave");
  revalidatePath("/hr");
  return { to };
}

/** Create a new leave request in SUBMITTED and alert HR. */
export async function createLeaveRequest(input: {
  employeeId: string;
  type: LeaveType;
  startDate: Date;
  endDate: Date;
  reason?: string;
}) {
  const leave = await db.$transaction(async (tx) => {
    const created = await tx.leaveRequest.create({
      data: {
        state: "SUBMITTED",
        employeeId: input.employeeId,
        type: input.type,
        startDate: input.startDate,
        endDate: input.endDate,
        reason: input.reason,
      },
      include: { employee: true },
    });

    await logTransition(tx, {
      entityType: "LeaveRequest",
      entityId: created.id,
      event: "submit",
      from: "DRAFT",
      to: "SUBMITTED",
      actorId: input.employeeId,
    });

    await notifyRole(tx, "HR", {
      type: "LEAVE_SUBMITTED",
      title: "New leave request",
      body: `${created.employee.name} requested ${created.type.toLowerCase()} leave`,
      link: "/hr/leave",
    });

    return created;
  });

  revalidatePath("/hr/leave");
  revalidatePath("/hr");
  return leave;
}
