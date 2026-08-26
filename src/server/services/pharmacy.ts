import "server-only";
import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";
import { db } from "@/server/db";
import {
  availableTransitions,
  drugOrderMachine,
  resolveTransition,
} from "@/server/fsm";
import type { Actor } from "@/server/session";
import { logTransition, notifyRole } from "./events";

export function drugOrderAffordances(state: string, actor: Actor) {
  return availableTransitions(drugOrderMachine, state as never, { role: actor.role });
}

/** Current on-hand quantity for a medication across all its batches. */
export async function stockLevel(medicationId: string): Promise<number> {
  const agg = await db.medicationBatch.aggregate({
    where: { medicationId },
    _sum: { quantity: true },
  });
  return agg._sum.quantity ?? 0;
}

/** Decrement `qty` from a medication's batches, earliest expiry first (FEFO). */
async function dispenseFromBatches(
  tx: Prisma.TransactionClient,
  medicationId: string,
  qty: number,
  actor: Actor,
  refId: string,
): Promise<number> {
  const batches = await tx.medicationBatch.findMany({
    where: { medicationId, quantity: { gt: 0 } },
    orderBy: { expiryDate: "asc" },
  });
  let remaining = qty;
  for (const b of batches) {
    if (remaining <= 0) break;
    const take = Math.min(b.quantity, remaining);
    await tx.medicationBatch.update({ where: { id: b.id }, data: { quantity: { decrement: take } } });
    await tx.stockMovement.create({
      data: { batchId: b.id, type: "DISPENSE", quantity: -take, reason: "Dispensed to patient", refType: "DrugOrderItem", refId, byUserId: actor.id },
    });
    remaining -= take;
  }
  return qty - remaining; // amount actually dispensed
}

export interface DispenseInput {
  itemId: string;
  quantity: number;
}

/** Dispense (some or all) items on a drug order; closes the visit when complete. */
export async function dispenseOrder(orderId: string, dispenses: DispenseInput[], actor: Actor) {
  const order = await db.drugOrder.findUnique({
    where: { id: orderId },
    include: { items: true, visit: true },
  });
  if (!order) throw new Error("Drug order not found");

  await db.$transaction(async (tx) => {
    for (const d of dispenses) {
      const item = order.items.find((i) => i.id === d.itemId);
      if (!item || d.quantity <= 0) continue;
      const need = Math.min(d.quantity, item.quantity - item.dispensedQty);
      if (need <= 0) continue;
      const got = await dispenseFromBatches(tx, item.medicationId, need, actor, item.id);
      const newDispensed = item.dispensedQty + got;
      await tx.drugOrderItem.update({
        where: { id: item.id },
        data: {
          dispensedQty: newDispensed,
          dispensedById: actor.id,
          dispensedAt: new Date(),
          state: got === 0 ? "OUT_OF_STOCK" : newDispensed >= item.quantity ? "DISPENSED" : "PENDING",
        },
      });
    }

    const items = await tx.drugOrderItem.findMany({ where: { orderId } });
    const allDone = items.every((i) => i.dispensedQty >= i.quantity || i.state === "CANCELLED");
    const event = allDone ? "dispense_all" : "record_partial";
    const { to } = resolveTransition(drugOrderMachine, order.state, event, { role: actor.role });
    await tx.drugOrder.update({ where: { id: orderId }, data: { state: to } });
    await logTransition(tx, { entityType: "DrugOrder", entityId: orderId, event, from: order.state, to, actorId: actor.id });

    // When fully dispensed, close the visit (pharmacy is the last stop).
    if (allDone && order.visit.state === "WAITING_FOR_PHARMACY") {
      await tx.visit.update({ where: { id: order.visitId }, data: { state: "COMPLETED", closedAt: new Date() } });
      await logTransition(tx, { entityType: "Visit", entityId: order.visitId, event: "dispensed", from: "WAITING_FOR_PHARMACY", to: "COMPLETED", actorId: actor.id });
      await notifyRole(tx, "RECEPTIONIST", { type: "VISIT_COMPLETED", title: "Visit completed", body: "Medication dispensed and visit closed", link: "/reception" });
    }
  });

  revalidatePath("/pharmacy");
  revalidatePath(`/pharmacy/${orderId}`);
  revalidatePath(`/visits/${order.visitId}`);
}

export async function cancelDrugOrder(orderId: string, actor: Actor, reason?: string) {
  const order = await db.drugOrder.findUnique({ where: { id: orderId } });
  if (!order) throw new Error("Not found");
  const { to } = resolveTransition(drugOrderMachine, order.state, "cancel", { role: actor.role });
  await db.$transaction(async (tx) => {
    await tx.drugOrder.update({ where: { id: orderId }, data: { state: to } });
    await tx.drugOrderItem.updateMany({ where: { orderId, state: "PENDING" }, data: { state: "CANCELLED" } });
    await logTransition(tx, { entityType: "DrugOrder", entityId: orderId, event: "cancel", from: order.state, to, actorId: actor.id, note: reason });
  });
  revalidatePath("/pharmacy");
}

/** Receive a new stock batch (goods-in). */
export async function receiveStock(
  input: { medicationId: string; batchNo: string; expiryDate: Date; quantity: number; costPrice?: number; sellPrice?: number; supplierId?: string },
  actor: Actor,
) {
  const batch = await db.medicationBatch.create({
    data: {
      medicationId: input.medicationId,
      batchNo: input.batchNo,
      expiryDate: input.expiryDate,
      quantity: input.quantity,
      costPrice: input.costPrice ?? 0,
      sellPrice: input.sellPrice ?? 0,
      supplierId: input.supplierId,
    },
  });
  await db.stockMovement.create({
    data: { batchId: batch.id, type: "RECEIVE", quantity: input.quantity, reason: "Goods received", byUserId: actor.id },
  });
  revalidatePath("/pharmacy/inventory");
  return batch;
}
