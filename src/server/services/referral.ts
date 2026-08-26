import "server-only";
import { revalidatePath } from "next/cache";
import type { ReferralUrgency } from "@prisma/client";
import { db } from "@/server/db";
import {
  availableTransitions,
  referralMachine,
  resolveTransition,
  type ReferralEvent,
} from "@/server/fsm";
import type { Actor } from "@/server/session";
import { makeCode } from "./ids";
import { logTransition, notifyRole } from "./events";

export interface CreateReferralInput {
  patientId: string;
  visitId?: string;
  toFacility: string;
  toDepartment?: string;
  reason: string;
  clinicalSummary?: string;
  urgency?: ReferralUrgency;
}

/** Affordances (available actions) for a referral given the actor's role. */
export function referralAffordances(state: string, actor: Actor) {
  return availableTransitions(referralMachine, state as never, { role: actor.role });
}

/**
 * Advance a referral through its lifecycle. Validates the transition through the
 * FSM (state + role), applies event side-effects atomically, records the
 * transition, and notifies the front desk when a referral is issued.
 */
export async function transitionReferral(
  id: string,
  event: ReferralEvent,
  actor: Actor,
  reason?: string,
) {
  const referral = await db.referral.findUnique({ where: { id } });
  if (!referral) throw new Error("Referral not found");

  // FSM gate — throws FsmError if illegal or unauthorized.
  const { to } = resolveTransition(referralMachine, referral.state, event, { role: actor.role });

  await db.$transaction(async (tx) => {
    if (event === "issue") {
      await tx.referral.update({ where: { id }, data: { issuedAt: new Date() } });
      await notifyRole(tx, "RECEPTIONIST", {
        type: "REFERRAL_ISSUED",
        title: "Referral issued",
        body: `${referral.referralNo} → ${referral.toFacility}`,
        link: `/referrals/${id}`,
      });
    }

    await tx.referral.update({ where: { id }, data: { state: to } });
    await logTransition(tx, {
      entityType: "Referral",
      entityId: id,
      event,
      from: referral.state,
      to,
      actorId: actor.id,
      note: reason,
    });
  });

  revalidatePath("/referrals");
  revalidatePath(`/referrals/${id}`);
  return { to };
}

/**
 * Standalone referral creation (outside the doctor visit "refer" flow). Creates
 * an already-ISSUED referral, records the transition, and notifies reception.
 */
export async function createReferral(input: CreateReferralInput, actor: Actor) {
  const seq = (await db.referral.count()) + 1;
  const referralNo = makeCode("R", seq);

  const referral = await db.$transaction(async (tx) => {
    const created = await tx.referral.create({
      data: {
        referralNo,
        state: "ISSUED",
        urgency: input.urgency ?? "ROUTINE",
        visitId: input.visitId,
        patientId: input.patientId,
        referredById: actor.id,
        toFacility: input.toFacility,
        toDepartment: input.toDepartment,
        reason: input.reason,
        clinicalSummary: input.clinicalSummary,
        issuedAt: new Date(),
      },
    });

    await logTransition(tx, {
      entityType: "Referral",
      entityId: created.id,
      event: "issue",
      from: "DRAFT",
      to: "ISSUED",
      actorId: actor.id,
    });

    await notifyRole(tx, "RECEPTIONIST", {
      type: "REFERRAL_ISSUED",
      title: "Referral issued",
      body: `${created.referralNo} → ${created.toFacility}`,
      link: `/referrals/${created.id}`,
    });

    return created;
  });

  revalidatePath("/referrals");
  return referral;
}
