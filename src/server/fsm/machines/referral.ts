import { ReferralState } from "@prisma/client";
import { defineMachine } from "../engine";

export type ReferralEvent = "issue" | "acknowledge" | "complete" | "cancel";

export const referralMachine = defineMachine<ReferralState, ReferralEvent>({
  entity: "Referral",
  initial: ReferralState.DRAFT,
  states: Object.values(ReferralState),
  final: [ReferralState.COMPLETED, ReferralState.CANCELLED],
  transitions: [
    {
      event: "issue",
      from: ReferralState.DRAFT,
      to: ReferralState.ISSUED,
      roles: ["DOCTOR"],
      label: "Issue referral",
      intent: "primary",
    },
    {
      event: "acknowledge",
      from: ReferralState.ISSUED,
      to: ReferralState.ACKNOWLEDGED,
      roles: ["RECEPTIONIST", "DOCTOR", "MANAGER"],
      label: "Mark acknowledged",
    },
    {
      event: "complete",
      from: [ReferralState.ISSUED, ReferralState.ACKNOWLEDGED],
      to: ReferralState.COMPLETED,
      roles: ["DOCTOR", "RECEPTIONIST"],
      label: "Close referral",
      intent: "success",
    },
    {
      event: "cancel",
      from: [ReferralState.DRAFT, ReferralState.ISSUED],
      to: ReferralState.CANCELLED,
      roles: ["DOCTOR", "MANAGER"],
      label: "Cancel referral",
      intent: "danger",
    },
  ],
});
