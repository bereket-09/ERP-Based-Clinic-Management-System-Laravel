import { LeaveState } from "@prisma/client";
import { defineMachine } from "../engine";

export type LeaveEvent =
  | "approve"
  | "reject"
  | "activate"
  | "request_return"
  | "approve_return"
  | "cancel";

/**
 * Leave lifecycle. When a request becomes ACTIVE the employee's
 * employmentStatus flips to ON_LEAVE, which blocks their login until they
 * return (soft/hard lock is configurable in the auth layer).
 */
export const leaveMachine = defineMachine<LeaveState, LeaveEvent>({
  entity: "LeaveRequest",
  initial: LeaveState.SUBMITTED,
  states: Object.values(LeaveState),
  final: [LeaveState.REJECTED, LeaveState.RETURNED, LeaveState.CANCELLED],
  transitions: [
    {
      event: "approve",
      from: LeaveState.SUBMITTED,
      to: LeaveState.APPROVED,
      roles: ["MANAGER", "HR"],
      label: "Approve",
      intent: "success",
      form: "leaveDecision",
    },
    {
      event: "reject",
      from: LeaveState.SUBMITTED,
      to: LeaveState.REJECTED,
      roles: ["MANAGER", "HR"],
      label: "Reject",
      intent: "danger",
      form: "leaveDecision",
    },
    {
      event: "activate",
      from: LeaveState.APPROVED,
      to: LeaveState.ACTIVE,
      roles: ["MANAGER", "HR"],
      label: "Start leave now",
      intent: "primary",
    },
    {
      event: "request_return",
      from: LeaveState.ACTIVE,
      to: LeaveState.RETURN_REQUESTED,
      label: "Request early return",
      intent: "primary",
    },
    {
      event: "approve_return",
      from: LeaveState.RETURN_REQUESTED,
      to: LeaveState.RETURNED,
      roles: ["MANAGER", "HR"],
      label: "Approve return",
      intent: "success",
    },
    {
      event: "cancel",
      from: [LeaveState.SUBMITTED, LeaveState.APPROVED],
      to: LeaveState.CANCELLED,
      label: "Cancel request",
      intent: "danger",
    },
  ],
});
