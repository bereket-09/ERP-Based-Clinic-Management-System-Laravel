import { AdmissionState } from "@prisma/client";
import { defineMachine } from "../engine";

export type AdmissionEvent = "settle" | "discharge" | "cancel";

export const admissionMachine = defineMachine<AdmissionState, AdmissionEvent>({
  entity: "Admission",
  initial: AdmissionState.ADMITTED,
  states: Object.values(AdmissionState),
  final: [
    AdmissionState.DISCHARGED,
    AdmissionState.TRANSFERRED,
    AdmissionState.CANCELLED,
  ],
  transitions: [
    {
      event: "settle",
      from: AdmissionState.ADMITTED,
      to: AdmissionState.ON_WARD,
      roles: ["NURSE"],
      label: "Settle on ward",
      intent: "primary",
    },
    {
      event: "discharge",
      from: [AdmissionState.ADMITTED, AdmissionState.ON_WARD],
      to: AdmissionState.DISCHARGED,
      roles: ["DOCTOR", "NURSE"],
      label: "Discharge",
      intent: "success",
      form: "discharge",
    },
    {
      event: "cancel",
      from: AdmissionState.ADMITTED,
      to: AdmissionState.CANCELLED,
      roles: ["NURSE", "MANAGER"],
      label: "Cancel admission",
      intent: "danger",
    },
  ],
});
