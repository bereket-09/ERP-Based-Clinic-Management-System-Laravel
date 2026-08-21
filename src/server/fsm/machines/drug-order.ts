import { DrugOrderState } from "@prisma/client";
import { defineMachine } from "../engine";

export type DrugOrderEvent =
  | "record_partial"
  | "dispense_all"
  | "cancel";

export const drugOrderMachine = defineMachine<DrugOrderState, DrugOrderEvent>({
  entity: "DrugOrder",
  initial: DrugOrderState.ORDERED,
  states: Object.values(DrugOrderState),
  final: [DrugOrderState.DISPENSED, DrugOrderState.CANCELLED],
  transitions: [
    {
      event: "record_partial",
      from: DrugOrderState.ORDERED,
      to: DrugOrderState.PARTIALLY_DISPENSED,
      roles: ["PHARMACIST"],
      label: "Record partial dispensing",
      intent: "primary",
      form: "dispense",
    },
    {
      event: "dispense_all",
      from: [DrugOrderState.ORDERED, DrugOrderState.PARTIALLY_DISPENSED],
      to: DrugOrderState.DISPENSED,
      roles: ["PHARMACIST"],
      label: "Dispense all & close",
      intent: "success",
      form: "dispense",
    },
    {
      event: "cancel",
      from: [DrugOrderState.ORDERED, DrugOrderState.PARTIALLY_DISPENSED],
      to: DrugOrderState.CANCELLED,
      roles: ["PHARMACIST", "MANAGER"],
      label: "Cancel order",
      intent: "danger",
      form: "cancelReason",
    },
  ],
});
