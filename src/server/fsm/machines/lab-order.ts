import { LabOrderState } from "@prisma/client";
import { defineMachine } from "../engine";

export type LabOrderEvent =
  | "collect"
  | "process"
  | "submit_results"
  | "complete"
  | "cancel";

export const labOrderMachine = defineMachine<LabOrderState, LabOrderEvent>({
  entity: "LabOrder",
  initial: LabOrderState.ORDERED,
  states: Object.values(LabOrderState),
  final: [LabOrderState.COMPLETED, LabOrderState.CANCELLED],
  transitions: [
    {
      event: "collect",
      from: LabOrderState.ORDERED,
      to: LabOrderState.COLLECTING,
      roles: ["LAB_TECH"],
      label: "Start specimen collection",
      intent: "primary",
    },
    {
      event: "process",
      from: [LabOrderState.ORDERED, LabOrderState.COLLECTING],
      to: LabOrderState.IN_PROGRESS,
      roles: ["LAB_TECH"],
      label: "Begin processing",
      intent: "primary",
    },
    {
      event: "submit_results",
      from: LabOrderState.IN_PROGRESS,
      to: LabOrderState.RESULTS_READY,
      roles: ["LAB_TECH"],
      label: "Submit results to doctor",
      intent: "success",
      form: "labResults",
    },
    {
      event: "complete",
      from: LabOrderState.RESULTS_READY,
      to: LabOrderState.COMPLETED,
      roles: ["LAB_TECH", "DOCTOR"],
      label: "Close lab order",
      intent: "success",
    },
    {
      event: "cancel",
      from: [
        LabOrderState.ORDERED,
        LabOrderState.COLLECTING,
        LabOrderState.IN_PROGRESS,
      ],
      to: LabOrderState.CANCELLED,
      roles: ["LAB_TECH", "MANAGER"],
      label: "Cancel order",
      intent: "danger",
      form: "cancelReason",
    },
  ],
});
