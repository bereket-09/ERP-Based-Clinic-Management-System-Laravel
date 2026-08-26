import { StockRequestState } from "@prisma/client";
import { defineMachine } from "../engine";

export type StockRequestEvent = "approve" | "reject" | "fulfill";

export const stockRequestMachine = defineMachine<StockRequestState, StockRequestEvent>({
  entity: "StockRequest",
  initial: StockRequestState.SUBMITTED,
  states: Object.values(StockRequestState),
  final: [StockRequestState.REJECTED, StockRequestState.FULFILLED],
  transitions: [
    {
      event: "approve",
      from: StockRequestState.SUBMITTED,
      to: StockRequestState.APPROVED,
      roles: ["STORE_KEEPER", "MANAGER"],
      label: "Approve",
      intent: "success",
    },
    {
      event: "reject",
      from: StockRequestState.SUBMITTED,
      to: StockRequestState.REJECTED,
      roles: ["STORE_KEEPER", "MANAGER"],
      label: "Reject",
      intent: "danger",
    },
    {
      event: "fulfill",
      from: StockRequestState.APPROVED,
      to: StockRequestState.FULFILLED,
      roles: ["STORE_KEEPER"],
      label: "Mark fulfilled",
      intent: "primary",
    },
  ],
});
