import { createMachine } from "xstate";
import type { MachineDef } from "./engine";

/**
 * Compile a declarative `MachineDef` into a real XState v5 machine. We keep the
 * declarative table as the source of truth (it carries roles, labels and form
 * hints XState doesn't model) and mirror it here so the statechart can be
 * visualized (Stately) and cross-checked in tests.
 */
export function toXStateMachine<S extends string, E extends string>(
  def: MachineDef<S, E>,
) {
  const states: Record<string, unknown> = {};

  for (const state of def.states) {
    if (def.final.includes(state)) {
      states[state] = { type: "final" };
      continue;
    }
    const on: Record<string, string> = {};
    for (const t of def.transitions) {
      const froms = Array.isArray(t.from) ? t.from : [t.from];
      if (froms.includes(state)) on[t.event] = t.to;
    }
    states[state] = { on };
  }

  return createMachine({
    id: def.entity,
    initial: def.initial,
    states,
  });
}
