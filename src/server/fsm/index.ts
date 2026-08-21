export * from "./engine";

export { visitMachine, type VisitEvent } from "./machines/visit";
export { labOrderMachine, type LabOrderEvent } from "./machines/lab-order";
export { drugOrderMachine, type DrugOrderEvent } from "./machines/drug-order";
export { leaveMachine, type LeaveEvent } from "./machines/leave";
export { referralMachine, type ReferralEvent } from "./machines/referral";
export { admissionMachine, type AdmissionEvent } from "./machines/admission";
export { stockRequestMachine, type StockRequestEvent } from "./machines/stock-request";

import { visitMachine } from "./machines/visit";
import { labOrderMachine } from "./machines/lab-order";
import { drugOrderMachine } from "./machines/drug-order";
import { leaveMachine } from "./machines/leave";
import { referralMachine } from "./machines/referral";
import { admissionMachine } from "./machines/admission";
import { stockRequestMachine } from "./machines/stock-request";

/** Registry of every machine keyed by its Prisma entity name. */
export const machines = {
  Visit: visitMachine,
  LabOrder: labOrderMachine,
  DrugOrder: drugOrderMachine,
  LeaveRequest: leaveMachine,
  Referral: referralMachine,
  Admission: admissionMachine,
  StockRequest: stockRequestMachine,
} as const;

export type EntityType = keyof typeof machines;
