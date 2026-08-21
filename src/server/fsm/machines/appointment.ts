import { AppointmentState } from "@prisma/client";
import { defineMachine } from "../engine";

export type AppointmentEvent = "confirm" | "check_in" | "complete" | "cancel" | "no_show";

export const appointmentMachine = defineMachine<AppointmentState, AppointmentEvent>({
  entity: "Appointment",
  initial: AppointmentState.SCHEDULED,
  states: Object.values(AppointmentState),
  final: [AppointmentState.COMPLETED, AppointmentState.CANCELLED, AppointmentState.NO_SHOW],
  transitions: [
    { event: "confirm", from: AppointmentState.SCHEDULED, to: AppointmentState.CONFIRMED, roles: ["RECEPTIONIST", "NURSE"], label: "Confirm", intent: "primary" },
    { event: "check_in", from: [AppointmentState.SCHEDULED, AppointmentState.CONFIRMED], to: AppointmentState.CHECKED_IN, roles: ["RECEPTIONIST", "NURSE"], label: "Check in", intent: "success" },
    { event: "complete", from: AppointmentState.CHECKED_IN, to: AppointmentState.COMPLETED, roles: ["DOCTOR", "RECEPTIONIST"], label: "Complete", intent: "success" },
    { event: "no_show", from: [AppointmentState.SCHEDULED, AppointmentState.CONFIRMED], to: AppointmentState.NO_SHOW, roles: ["RECEPTIONIST", "NURSE"], label: "No-show", intent: "danger" },
    { event: "cancel", from: [AppointmentState.SCHEDULED, AppointmentState.CONFIRMED], to: AppointmentState.CANCELLED, roles: ["RECEPTIONIST", "MANAGER"], label: "Cancel", intent: "danger" },
  ],
});
