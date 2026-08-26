import type { Role } from "@prisma/client";

/**
 * A tiny, declarative finite-state-machine engine.
 *
 * Each domain entity (Visit, LabOrder, DrugOrder, LeaveRequest, ...) is described
 * by a `MachineDef`: a set of states and role-guarded transitions. This single
 * definition is the authority for:
 *
 *   1. VALIDATION  — services call `resolveTransition()` before mutating state, so
 *      an illegal or unauthorized transition can never be persisted.
 *   2. AFFORDANCES — `availableTransitions()` returns exactly the actions the
 *      current user may take right now. The API ships these to the React client,
 *      which renders precisely those buttons/forms and nothing else. This is the
 *      "backend decides what the frontend shows" (HATEOAS-style) contract.
 *
 * The definitions are mirrored into real XState machines in `./xstate.ts` for
 * testing and visualization, keeping the two representations in lock-step.
 */

export type TransitionIntent = "primary" | "default" | "danger" | "success";

export interface TransitionDef<S extends string, E extends string, Ctx = unknown> {
  /** Event name that triggers this transition (unique per source state). */
  event: E;
  /** Source state(s) this transition may fire from. */
  from: S | S[];
  /** Destination state. */
  to: S;
  /** Roles allowed to trigger it. Omitted/empty ⇒ any authenticated user. */
  roles?: Role[];
  /** Human label the client renders on the action button. */
  label: string;
  description?: string;
  /** Styling hint for the client. */
  intent?: TransitionIntent;
  /**
   * Key naming a data form the client must collect before firing (e.g.
   * "diagnosis", "referral"). The frontend maps this to a known form; the
   * backend re-validates. Undefined ⇒ no extra input needed.
   */
  form?: string;
  /** Optional runtime guard evaluated against server-provided context. */
  guard?: (ctx: Ctx) => boolean;
}

export interface MachineDef<S extends string, E extends string, Ctx = unknown> {
  entity: string;
  initial: S;
  states: readonly S[];
  /** States with no outgoing transitions (for UI treatment). */
  final: readonly S[];
  transitions: TransitionDef<S, E, Ctx>[];
}

/** A serializable affordance shipped to the client. */
export interface Affordance<S extends string = string, E extends string = string> {
  event: E;
  to: S;
  label: string;
  description?: string;
  intent: TransitionIntent;
  form?: string;
}

export class FsmError extends Error {
  constructor(
    message: string,
    readonly code: "INVALID_STATE" | "ILLEGAL_TRANSITION" | "FORBIDDEN",
  ) {
    super(message);
    this.name = "FsmError";
  }
}

/** Identity helper that preserves literal types on a machine definition. */
export function defineMachine<S extends string, E extends string, Ctx = unknown>(
  def: MachineDef<S, E, Ctx>,
): MachineDef<S, E, Ctx> {
  return def;
}

function fromMatches<S extends string>(from: S | S[], state: S): boolean {
  return Array.isArray(from) ? from.includes(state) : from === state;
}

function roleAllowed(roles: Role[] | undefined, role: Role | null | undefined): boolean {
  if (!roles || roles.length === 0) return true;
  return !!role && roles.includes(role);
}

/**
 * Actions the given actor may take from `state` right now — the affordance list.
 */
export function availableTransitions<S extends string, E extends string, Ctx>(
  machine: MachineDef<S, E, Ctx>,
  state: S,
  opts: { role?: Role | null; ctx?: Ctx } = {},
): Affordance<S, E>[] {
  const { role, ctx } = opts;
  return machine.transitions
    .filter((t) => fromMatches(t.from, state))
    .filter((t) => roleAllowed(t.roles, role))
    .filter((t) => !t.guard || (ctx !== undefined && t.guard(ctx)))
    .map((t) => ({
      event: t.event,
      to: t.to,
      label: t.label,
      description: t.description,
      intent: t.intent ?? "default",
      form: t.form,
    }));
}

/** True if the actor could fire `event` from `state`. */
export function canFire<S extends string, E extends string, Ctx>(
  machine: MachineDef<S, E, Ctx>,
  state: S,
  event: E,
  opts: { role?: Role | null; ctx?: Ctx } = {},
): boolean {
  return availableTransitions(machine, state, opts).some((a) => a.event === event);
}

/**
 * Validate a transition and return its destination state, or throw `FsmError`.
 * Services call this immediately before persisting the new state.
 */
export function resolveTransition<S extends string, E extends string, Ctx>(
  machine: MachineDef<S, E, Ctx>,
  state: S,
  event: E,
  opts: { role?: Role | null; ctx?: Ctx } = {},
): { to: S; def: TransitionDef<S, E, Ctx> } {
  if (!machine.states.includes(state)) {
    throw new FsmError(`${machine.entity}: unknown state "${state}"`, "INVALID_STATE");
  }
  const candidates = machine.transitions.filter(
    (t) => t.event === event && fromMatches(t.from, state),
  );
  if (candidates.length === 0) {
    throw new FsmError(
      `${machine.entity}: cannot "${event}" from "${state}"`,
      "ILLEGAL_TRANSITION",
    );
  }
  const def = candidates[0];
  if (!roleAllowed(def.roles, opts.role)) {
    throw new FsmError(
      `${machine.entity}: role not permitted to "${event}"`,
      "FORBIDDEN",
    );
  }
  if (def.guard && (opts.ctx === undefined || !def.guard(opts.ctx))) {
    throw new FsmError(
      `${machine.entity}: guard blocked "${event}" from "${state}"`,
      "ILLEGAL_TRANSITION",
    );
  }
  return { to: def.to, def };
}
