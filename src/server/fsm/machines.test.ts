import { describe, expect, it } from "vitest";
import {
  resolveTransition,
  canFire,
  availableTransitions,
  labOrderMachine,
  drugOrderMachine,
  leaveMachine,
  referralMachine,
  admissionMachine,
  stockRequestMachine,
  appointmentMachine,
  invoiceMachine,
} from "./index";

describe("Lab order flow", () => {
  it("collect → process → submit_results → complete", () => {
    expect(resolveTransition(labOrderMachine, "ORDERED", "collect", { role: "LAB_TECH" }).to).toBe("COLLECTING");
    expect(resolveTransition(labOrderMachine, "COLLECTING", "process", { role: "LAB_TECH" }).to).toBe("IN_PROGRESS");
    expect(resolveTransition(labOrderMachine, "IN_PROGRESS", "submit_results", { role: "LAB_TECH" }).to).toBe("RESULTS_READY");
    expect(resolveTransition(labOrderMachine, "RESULTS_READY", "complete", { role: "DOCTOR" }).to).toBe("COMPLETED");
  });
  it("a pharmacist cannot process lab work", () => {
    expect(canFire(labOrderMachine, "ORDERED", "collect", { role: "PHARMACIST" })).toBe(false);
  });
});

describe("Drug order flow", () => {
  it("ORDERED → dispense_all → DISPENSED", () => {
    expect(resolveTransition(drugOrderMachine, "ORDERED", "dispense_all", { role: "PHARMACIST" }).to).toBe("DISPENSED");
  });
  it("partial then full", () => {
    expect(resolveTransition(drugOrderMachine, "ORDERED", "record_partial", { role: "PHARMACIST" }).to).toBe("PARTIALLY_DISPENSED");
    expect(resolveTransition(drugOrderMachine, "PARTIALLY_DISPENSED", "dispense_all", { role: "PHARMACIST" }).to).toBe("DISPENSED");
  });
});

describe("Leave flow drives ON_LEAVE", () => {
  it("submitted → approved → active → return", () => {
    expect(resolveTransition(leaveMachine, "SUBMITTED", "approve", { role: "HR" }).to).toBe("APPROVED");
    expect(resolveTransition(leaveMachine, "APPROVED", "activate", { role: "HR" }).to).toBe("ACTIVE");
    expect(resolveTransition(leaveMachine, "ACTIVE", "request_return", {}).to).toBe("RETURN_REQUESTED");
    expect(resolveTransition(leaveMachine, "RETURN_REQUESTED", "approve_return", { role: "MANAGER" }).to).toBe("RETURNED");
  });
  it("a doctor cannot approve leave", () => {
    expect(canFire(leaveMachine, "SUBMITTED", "approve", { role: "DOCTOR" })).toBe(false);
  });
});

describe("Referral, admission, stock-request, appointment, invoice", () => {
  it("referral issue → acknowledge → complete", () => {
    expect(resolveTransition(referralMachine, "DRAFT", "issue", { role: "DOCTOR" }).to).toBe("ISSUED");
    expect(resolveTransition(referralMachine, "ISSUED", "acknowledge", { role: "RECEPTIONIST" }).to).toBe("ACKNOWLEDGED");
    expect(resolveTransition(referralMachine, "ACKNOWLEDGED", "complete", { role: "DOCTOR" }).to).toBe("COMPLETED");
  });
  it("admission settle → discharge", () => {
    expect(resolveTransition(admissionMachine, "ADMITTED", "settle", { role: "NURSE" }).to).toBe("ON_WARD");
    expect(resolveTransition(admissionMachine, "ON_WARD", "discharge", { role: "DOCTOR" }).to).toBe("DISCHARGED");
  });
  it("stock request approve → fulfill", () => {
    expect(resolveTransition(stockRequestMachine, "SUBMITTED", "approve", { role: "STORE_KEEPER" }).to).toBe("APPROVED");
    expect(resolveTransition(stockRequestMachine, "APPROVED", "fulfill", { role: "STORE_KEEPER" }).to).toBe("FULFILLED");
  });
  it("appointment confirm → check_in → complete", () => {
    expect(resolveTransition(appointmentMachine, "SCHEDULED", "confirm", { role: "RECEPTIONIST" }).to).toBe("CONFIRMED");
    expect(resolveTransition(appointmentMachine, "CONFIRMED", "check_in", { role: "RECEPTIONIST" }).to).toBe("CHECKED_IN");
    expect(resolveTransition(appointmentMachine, "CHECKED_IN", "complete", { role: "DOCTOR" }).to).toBe("COMPLETED");
  });
  it("invoice issue → settle", () => {
    expect(resolveTransition(invoiceMachine, "DRAFT", "issue", { role: "RECEPTIONIST" }).to).toBe("ISSUED");
    expect(resolveTransition(invoiceMachine, "ISSUED", "settle", { role: "RECEPTIONIST" }).to).toBe("PAID");
    expect(availableTransitions(invoiceMachine, "PAID", { role: "MANAGER" })).toHaveLength(0);
  });
});
