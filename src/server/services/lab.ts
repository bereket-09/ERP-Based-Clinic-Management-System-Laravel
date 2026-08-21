import "server-only";
import { revalidatePath } from "next/cache";
import type { ResultFlag } from "@prisma/client";
import { db } from "@/server/db";
import {
  availableTransitions,
  labOrderMachine,
  resolveTransition,
  type LabOrderEvent,
} from "@/server/fsm";
import type { Actor } from "@/server/session";
import { logTransition, notifyUser } from "./events";

export interface LabResultInput {
  itemId: string;
  resultValue?: string;
  resultFlag?: ResultFlag;
  resultNotes?: string;
}

export function labOrderAffordances(state: string, actor: Actor) {
  return availableTransitions(labOrderMachine, state as never, { role: actor.role });
}

export async function transitionLabOrder(
  orderId: string,
  event: LabOrderEvent,
  actor: Actor,
  payload: { results?: LabResultInput[]; reason?: string } = {},
) {
  const order = await db.labOrder.findUnique({ where: { id: orderId }, include: { visit: true } });
  if (!order) throw new Error("Lab order not found");

  const { to } = resolveTransition(labOrderMachine, order.state, event, { role: actor.role });

  await db.$transaction(async (tx) => {
    if (event === "collect") {
      await tx.labOrderItem.updateMany({ where: { orderId, state: "PENDING" }, data: { state: "COLLECTED" } });
    }
    if (event === "process") {
      await tx.labOrderItem.updateMany({ where: { orderId, state: { in: ["PENDING", "COLLECTED"] } }, data: { state: "IN_PROGRESS" } });
    }
    if (event === "submit_results") {
      for (const r of payload.results ?? []) {
        await tx.labOrderItem.update({
          where: { id: r.itemId },
          data: {
            resultValue: r.resultValue,
            resultFlag: r.resultFlag,
            resultNotes: r.resultNotes,
            state: "RESULTED",
            resultedById: actor.id,
            resultedAt: new Date(),
          },
        });
      }
      // Route results back to the ordering doctor (visit → LAB_RESULTS_READY).
      if (order.visit.state === "WAITING_FOR_LAB") {
        await tx.visit.update({ where: { id: order.visitId }, data: { state: "LAB_RESULTS_READY" } });
        await logTransition(tx, {
          entityType: "Visit",
          entityId: order.visitId,
          event: "lab_results_ready",
          from: "WAITING_FOR_LAB",
          to: "LAB_RESULTS_READY",
          actorId: actor.id,
        });
        if (order.visit.doctorId) {
          await notifyUser(tx, order.visit.doctorId, {
            type: "LAB_RESULTS_READY",
            title: "Lab results ready",
            body: "Results are back for your patient",
            link: `/visits/${order.visitId}`,
          });
        }
      }
    }
    if (event === "cancel") {
      await tx.labOrderItem.updateMany({ where: { orderId }, data: { state: "CANCELLED" } });
    }

    await tx.labOrder.update({ where: { id: orderId }, data: { state: to } });
    await logTransition(tx, {
      entityType: "LabOrder",
      entityId: orderId,
      event,
      from: order.state,
      to,
      actorId: actor.id,
      note: payload.reason,
    });
  });

  revalidatePath("/lab");
  revalidatePath(`/lab/${orderId}`);
  revalidatePath(`/visits/${order.visitId}`);
  return { to };
}
