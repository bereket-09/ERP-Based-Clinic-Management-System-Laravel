import "server-only";
import { revalidatePath } from "next/cache";
import type { AssetAssignmentState } from "@prisma/client";
import { db } from "@/server/db";
import {
  availableTransitions,
  resolveTransition,
  stockRequestMachine,
  type StockRequestEvent,
} from "@/server/fsm";
import type { Actor } from "@/server/session";
import { makeCode } from "./ids";
import { audit, logTransition, notifyRole } from "./events";

/* ------------------------------------------------------------------ */
/* Revalidation helpers                                                 */
/* ------------------------------------------------------------------ */

function revalidateStore() {
  revalidatePath("/store");
}

function revalidateAssets(assetId?: string) {
  revalidatePath("/store");
  revalidatePath("/store/assets");
  if (assetId) revalidatePath(`/store/assets/${assetId}`);
}

function revalidateRequests() {
  revalidatePath("/store");
  revalidatePath("/store/requests");
}

function revalidatePurchaseOrders(poId?: string) {
  revalidatePath("/store");
  revalidatePath("/store/purchase-orders");
  if (poId) revalidatePath(`/store/purchase-orders/${poId}`);
}

/* ------------------------------------------------------------------ */
/* Assets                                                              */
/* ------------------------------------------------------------------ */

export interface AssetInput {
  tag: string;
  name: string;
  category?: string | null;
  serialNo?: string | null;
  quantity?: number;
  unitPrice?: number;
  receiptNo?: string | null;
}

export async function addAsset(input: AssetInput, actor: Actor) {
  const asset = await db.asset.create({
    data: {
      tag: input.tag.trim(),
      name: input.name.trim(),
      category: input.category?.trim() || null,
      serialNo: input.serialNo?.trim() || null,
      quantity: input.quantity ?? 1,
      unitPrice: input.unitPrice ?? 0,
      receiptNo: input.receiptNo?.trim() || null,
    },
  });
  await audit(actor.id, "asset.create", "Asset", asset.id, { tag: asset.tag, name: asset.name });
  revalidateAssets(asset.id);
  return asset;
}

export async function updateAsset(id: string, input: AssetInput, actor: Actor) {
  const asset = await db.asset.update({
    where: { id },
    data: {
      tag: input.tag.trim(),
      name: input.name.trim(),
      category: input.category?.trim() || null,
      serialNo: input.serialNo?.trim() || null,
      quantity: input.quantity ?? 1,
      unitPrice: input.unitPrice ?? 0,
      receiptNo: input.receiptNo?.trim() || null,
    },
  });
  await audit(actor.id, "asset.update", "Asset", asset.id, { tag: asset.tag, name: asset.name });
  revalidateAssets(asset.id);
  return asset;
}

/**
 * Issue an asset (or a quantity of it) to a staff member. Records the assignment
 * in the ASSIGNED state and notifies the recipient.
 */
export async function assignAsset(
  input: { assetId: string; userId: string; quantity: number },
  actor: Actor,
) {
  const asset = await db.asset.findUnique({ where: { id: input.assetId } });
  if (!asset) throw new Error("Asset not found");
  const qty = input.quantity > 0 ? input.quantity : 1;

  const assignment = await db.$transaction(async (tx) => {
    const created = await tx.assetAssignment.create({
      data: {
        assetId: input.assetId,
        userId: input.userId,
        quantity: qty,
        state: "ASSIGNED",
      },
    });
    await logTransition(tx, {
      entityType: "AssetAssignment",
      entityId: created.id,
      event: "assign",
      from: "—",
      to: "ASSIGNED",
      actorId: actor.id,
      note: `${qty} × ${asset.name} (${asset.tag})`,
    });
    return created;
  });

  await audit(actor.id, "asset.assign", "AssetAssignment", assignment.id, {
    assetId: input.assetId,
    userId: input.userId,
    quantity: qty,
  });
  revalidateAssets(input.assetId);
  return assignment;
}

/** Close out an assignment: RETURNED / LOST / DAMAGED. */
export async function returnAsset(
  assignmentId: string,
  state: Extract<AssetAssignmentState, "RETURNED" | "LOST" | "DAMAGED">,
  actor: Actor,
) {
  const assignment = await db.assetAssignment.findUnique({ where: { id: assignmentId } });
  if (!assignment) throw new Error("Assignment not found");
  if (assignment.state !== "ASSIGNED") throw new Error("This assignment is already closed");

  await db.$transaction(async (tx) => {
    await tx.assetAssignment.update({
      where: { id: assignmentId },
      data: { state, returnedAt: new Date() },
    });
    await logTransition(tx, {
      entityType: "AssetAssignment",
      entityId: assignmentId,
      event: state.toLowerCase(),
      from: assignment.state,
      to: state,
      actorId: actor.id,
    });
  });

  await audit(actor.id, "asset.return", "AssetAssignment", assignmentId, { state });
  revalidateAssets(assignment.assetId);
  return { to: state };
}

/* ------------------------------------------------------------------ */
/* Stock requests                                                      */
/* ------------------------------------------------------------------ */

export async function createStockRequest(
  input: { itemName: string; quantity: number; reason?: string | null },
  actor: Actor,
) {
  const request = await db.$transaction(async (tx) => {
    const created = await tx.stockRequest.create({
      data: {
        requesterId: actor.id,
        itemName: input.itemName.trim(),
        quantity: input.quantity > 0 ? input.quantity : 1,
        reason: input.reason?.trim() || null,
        state: "SUBMITTED",
      },
    });
    await notifyRole(tx, "STORE_KEEPER", {
      type: "GENERIC",
      title: "New stock request",
      body: `${created.quantity} × ${created.itemName}`,
      link: "/store/requests",
    });
    return created;
  });

  await audit(actor.id, "stock_request.create", "StockRequest", request.id, {
    itemName: request.itemName,
    quantity: request.quantity,
  });
  revalidateRequests();
  return request;
}

/** Affordances (available actions) for a stock request given the actor's role. */
export function stockRequestAffordances(state: string, actor: Actor) {
  return availableTransitions(stockRequestMachine, state as never, { role: actor.role });
}

/**
 * The single entry point for advancing a stock request. Mirrors the visit
 * service: validates the transition through the FSM (state + role), persists the
 * new state, records the transition, then revalidates the store views.
 */
export async function transitionStockRequest(
  id: string,
  event: StockRequestEvent,
  actor: Actor,
) {
  const request = await db.stockRequest.findUnique({ where: { id } });
  if (!request) throw new Error("Stock request not found");

  // FSM gate — throws FsmError if illegal or unauthorized.
  const { to } = resolveTransition(stockRequestMachine, request.state, event, { role: actor.role });

  await db.$transaction(async (tx) => {
    await tx.stockRequest.update({ where: { id }, data: { state: to } });
    await logTransition(tx, {
      entityType: "StockRequest",
      entityId: id,
      event,
      from: request.state,
      to,
      actorId: actor.id,
    });
    if (event === "approve" || event === "reject" || event === "fulfill") {
      await notifyUserSafe(tx, request.requesterId, event, request.itemName);
    }
  });

  await audit(actor.id, `stock_request.${event}`, "StockRequest", id, { to });
  revalidateRequests();
  return { to };
}

async function notifyUserSafe(
  tx: Parameters<typeof notifyRole>[0],
  userId: string,
  event: StockRequestEvent,
  itemName: string,
) {
  const titles: Record<StockRequestEvent, string> = {
    approve: "Stock request approved",
    reject: "Stock request rejected",
    fulfill: "Stock request fulfilled",
  };
  await tx.notification.create({
    data: {
      recipientId: userId,
      type: "GENERIC",
      title: titles[event],
      body: itemName,
      link: "/store/requests",
    },
  });
}

/* ------------------------------------------------------------------ */
/* Purchase orders                                                     */
/* ------------------------------------------------------------------ */

export interface PurchaseOrderItemInput {
  itemName: string;
  quantity: number;
  unitPrice: number;
  medicationId?: string | null;
}

export async function createPurchaseOrder(
  input: {
    supplierId?: string | null;
    items: PurchaseOrderItemInput[];
    note?: string | null;
  },
  actor: Actor,
) {
  const items = input.items.filter((i) => i.itemName.trim() && i.quantity > 0);
  if (items.length === 0) throw new Error("Add at least one line item");

  const total = items.reduce((sum, i) => sum + i.quantity * (i.unitPrice || 0), 0);

  const po = await db.$transaction(async (tx) => {
    const seq = (await tx.purchaseOrder.count()) + 1;
    const created = await tx.purchaseOrder.create({
      data: {
        poNo: makeCode("PO", seq),
        state: "ORDERED",
        supplierId: input.supplierId || null,
        createdById: actor.id,
        total,
        note: input.note?.trim() || null,
        items: {
          create: items.map((i) => ({
            itemName: i.itemName.trim(),
            quantity: i.quantity,
            unitPrice: i.unitPrice || 0,
            medicationId: i.medicationId || null,
          })),
        },
      },
    });
    await logTransition(tx, {
      entityType: "PurchaseOrder",
      entityId: created.id,
      event: "order",
      from: "DRAFT",
      to: "ORDERED",
      actorId: actor.id,
      note: created.poNo,
    });
    return created;
  });

  await audit(actor.id, "purchase_order.create", "PurchaseOrder", po.id, {
    poNo: po.poNo,
    total,
    items: items.length,
  });
  revalidatePurchaseOrders(po.id);
  return po;
}

/**
 * Record a goods receipt against a purchase order: increment each line's
 * `received` count and move the PO to RECEIVED (everything in) or
 * PARTIALLY_RECEIVED.
 */
export async function receivePurchaseOrder(
  id: string,
  receipts: Array<{ itemId: string; quantity: number }>,
  actor: Actor,
) {
  const po = await db.purchaseOrder.findUnique({ where: { id }, include: { items: true } });
  if (!po) throw new Error("Purchase order not found");
  if (po.state === "RECEIVED" || po.state === "CANCELLED") {
    throw new Error("This purchase order can no longer receive stock");
  }

  const byId = new Map(po.items.map((i) => [i.id, i]));
  const applied = receipts.filter((r) => r.quantity > 0 && byId.has(r.itemId));
  if (applied.length === 0) throw new Error("Enter a quantity to receive");

  const to = await db.$transaction(async (tx) => {
    // Project the resulting received totals so we can decide the PO state.
    const projected = new Map(po.items.map((i) => [i.id, i.received]));
    for (const r of applied) {
      const item = byId.get(r.itemId)!;
      const next = Math.min(item.received + r.quantity, item.quantity);
      projected.set(r.itemId, next);
      await tx.purchaseOrderItem.update({
        where: { id: r.itemId },
        data: { received: next },
      });
    }

    const fullyReceived = po.items.every((i) => (projected.get(i.id) ?? 0) >= i.quantity);
    const nextState = fullyReceived ? "RECEIVED" : "PARTIALLY_RECEIVED";

    await tx.purchaseOrder.update({ where: { id }, data: { state: nextState } });
    await logTransition(tx, {
      entityType: "PurchaseOrder",
      entityId: id,
      event: "receive",
      from: po.state,
      to: nextState,
      actorId: actor.id,
      note: `${applied.length} line(s) received`,
    });
    return nextState;
  });

  await audit(actor.id, "purchase_order.receive", "PurchaseOrder", id, { to });
  revalidatePurchaseOrders(id);
  return { to };
}

/** Cancel an open purchase order. */
export async function cancelPurchaseOrder(id: string, reason: string | undefined, actor: Actor) {
  const po = await db.purchaseOrder.findUnique({ where: { id } });
  if (!po) throw new Error("Purchase order not found");
  if (po.state === "RECEIVED" || po.state === "CANCELLED") {
    throw new Error("This purchase order can no longer be cancelled");
  }

  await db.$transaction(async (tx) => {
    await tx.purchaseOrder.update({ where: { id }, data: { state: "CANCELLED" } });
    await logTransition(tx, {
      entityType: "PurchaseOrder",
      entityId: id,
      event: "cancel",
      from: po.state,
      to: "CANCELLED",
      actorId: actor.id,
      note: reason,
    });
  });

  await audit(actor.id, "purchase_order.cancel", "PurchaseOrder", id, { reason });
  revalidatePurchaseOrders(id);
  return { to: "CANCELLED" as const };
}
