import { describe, expect, it } from "vitest";
import { createActor } from "xstate";
import {
  availableTransitions,
  canFire,
  FsmError,
  machines,
  resolveTransition,
  visitMachine,
} from "./index";
import { toXStateMachine } from "./xstate";

describe("FSM engine — visit clinical spine", () => {
  it("lets a doctor begin a consultation from the queue", () => {
    const { to } = resolveTransition(visitMachine, "WAITING_FOR_DOCTOR", "begin_consultation", {
      role: "DOCTOR",
    });
    expect(to).toBe("IN_CONSULTATION");
  });

  it("forbids a receptionist from beginning a consultation", () => {
    expect(() =>
      resolveTransition(visitMachine, "WAITING_FOR_DOCTOR", "begin_consultation", {
        role: "RECEPTIONIST",
      }),
    ).toThrow(FsmError);
  });

  it("rejects an illegal transition", () => {
    expect(() =>
      resolveTransition(visitMachine, "REGISTERED", "complete", { role: "DOCTOR" }),
    ).toThrow(/cannot "complete" from "REGISTERED"/);
  });

  it("routes lab results back to the doctor, not to completion", () => {
    const { to } = resolveTransition(visitMachine, "WAITING_FOR_LAB", "lab_results_ready", {
      role: "LAB_TECH",
    });
    expect(to).toBe("LAB_RESULTS_READY");
    const next = resolveTransition(visitMachine, "LAB_RESULTS_READY", "resume_consultation", {
      role: "DOCTOR",
    });
    expect(next.to).toBe("IN_CONSULTATION");
  });

  it("exposes role-scoped affordances (backend-driven UI contract)", () => {
    const doctor = availableTransitions(visitMachine, "IN_CONSULTATION", { role: "DOCTOR" });
    const events = doctor.map((a) => a.event).sort();
    expect(events).toEqual(
      ["admit", "complete", "order_labs", "prescribe", "refer"].sort(),
    );
    // a nurse standing in the same state sees nothing actionable here
    expect(availableTransitions(visitMachine, "IN_CONSULTATION", { role: "NURSE" })).toHaveLength(1); // admit
    expect(canFire(visitMachine, "IN_CONSULTATION", "prescribe", { role: "NURSE" })).toBe(false);
  });
});

describe("FSM engine — every machine is internally consistent", () => {
  it("has a valid initial state and reachable finals", () => {
    for (const machine of Object.values(machines)) {
      expect(machine.states).toContain(machine.initial);
      for (const f of machine.final) expect(machine.states).toContain(f);
      for (const t of machine.transitions) {
        const froms = Array.isArray(t.from) ? t.from : [t.from];
        for (const f of froms) expect(machine.states).toContain(f);
        expect(machine.states).toContain(t.to);
      }
    }
  });
});

describe("FSM engine — declarative table matches the XState mirror", () => {
  it("agrees on transition targets across all machines", () => {
    for (const machine of Object.values(machines)) {
      const xs = toXStateMachine(machine);
      for (const t of machine.transitions) {
        const froms = Array.isArray(t.from) ? t.from : [t.from];
        for (const from of froms) {
          const actor = createActor(xs, { snapshot: xs.resolveState({ value: from }) });
          actor.start();
          actor.send({ type: t.event });
          expect(actor.getSnapshot().value).toBe(t.to);
          actor.stop();
        }
      }
    }
  });
});
