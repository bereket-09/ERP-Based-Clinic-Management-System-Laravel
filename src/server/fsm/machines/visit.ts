import { VisitState } from "@prisma/client";
import { defineMachine } from "../engine";

export type VisitEvent =
  | "start_triage"
  | "send_to_doctor"
  | "begin_consultation"
  | "order_labs"
  | "prescribe"
  | "refer"
  | "admit"
  | "complete"
  | "lab_results_ready"
  | "resume_consultation"
  | "dispensed"
  | "discharge"
  | "cancel";

/**
 * The clinical spine. A visit flows reception → triage → doctor → (lab / pharmacy
 * / referral / admission) → completed. Lab results route BACK to the doctor
 * (LAB_RESULTS_READY) for re-assessment rather than closing the visit.
 */
export const visitMachine = defineMachine<VisitState, VisitEvent>({
  entity: "Visit",
  initial: VisitState.REGISTERED,
  states: Object.values(VisitState),
  final: [VisitState.COMPLETED, VisitState.CANCELLED],
  transitions: [
    {
      event: "start_triage",
      from: VisitState.REGISTERED,
      to: VisitState.TRIAGE,
      roles: ["NURSE", "RECEPTIONIST"],
      label: "Start triage",
      intent: "primary",
      form: "vitals",
    },
    {
      event: "send_to_doctor",
      from: [VisitState.REGISTERED, VisitState.TRIAGE],
      to: VisitState.WAITING_FOR_DOCTOR,
      roles: ["NURSE", "RECEPTIONIST"],
      label: "Send to doctor",
      intent: "primary",
      form: "assignDoctor",
    },
    {
      event: "begin_consultation",
      from: VisitState.WAITING_FOR_DOCTOR,
      to: VisitState.IN_CONSULTATION,
      roles: ["DOCTOR"],
      label: "Begin consultation",
      intent: "primary",
    },
    {
      event: "order_labs",
      from: VisitState.IN_CONSULTATION,
      to: VisitState.WAITING_FOR_LAB,
      roles: ["DOCTOR"],
      label: "Order lab tests",
      form: "labOrder",
    },
    {
      event: "prescribe",
      from: VisitState.IN_CONSULTATION,
      to: VisitState.WAITING_FOR_PHARMACY,
      roles: ["DOCTOR"],
      label: "Prescribe medication",
      form: "drugOrder",
    },
    {
      event: "refer",
      from: VisitState.IN_CONSULTATION,
      to: VisitState.REFERRED,
      roles: ["DOCTOR"],
      label: "Refer externally",
      form: "referral",
    },
    {
      event: "admit",
      from: VisitState.IN_CONSULTATION,
      to: VisitState.ADMITTED,
      roles: ["DOCTOR", "NURSE"],
      label: "Admit to ward",
      form: "admission",
    },
    {
      event: "complete",
      from: VisitState.IN_CONSULTATION,
      to: VisitState.COMPLETED,
      roles: ["DOCTOR"],
      label: "Complete visit",
      intent: "success",
      form: "diagnosis",
    },
    {
      event: "lab_results_ready",
      from: VisitState.WAITING_FOR_LAB,
      to: VisitState.LAB_RESULTS_READY,
      roles: ["LAB_TECH"],
      label: "Results ready",
      intent: "success",
    },
    {
      event: "resume_consultation",
      from: [VisitState.LAB_RESULTS_READY, VisitState.WAITING_FOR_PHARMACY],
      to: VisitState.IN_CONSULTATION,
      roles: ["DOCTOR"],
      label: "Resume consultation",
      intent: "primary",
    },
    {
      event: "dispensed",
      from: VisitState.WAITING_FOR_PHARMACY,
      to: VisitState.COMPLETED,
      roles: ["PHARMACIST"],
      label: "Medication dispensed — close visit",
      intent: "success",
    },
    {
      event: "discharge",
      from: VisitState.ADMITTED,
      to: VisitState.COMPLETED,
      roles: ["DOCTOR", "NURSE"],
      label: "Discharge",
      intent: "success",
      form: "discharge",
    },
    {
      event: "complete",
      from: VisitState.REFERRED,
      to: VisitState.COMPLETED,
      roles: ["DOCTOR", "RECEPTIONIST"],
      label: "Close referred visit",
      intent: "success",
    },
    {
      event: "cancel",
      from: [
        VisitState.REGISTERED,
        VisitState.TRIAGE,
        VisitState.WAITING_FOR_DOCTOR,
        VisitState.WAITING_FOR_LAB,
      ],
      to: VisitState.CANCELLED,
      roles: ["MANAGER", "RECEPTIONIST"],
      label: "Cancel visit",
      intent: "danger",
      form: "cancelReason",
    },
  ],
});
