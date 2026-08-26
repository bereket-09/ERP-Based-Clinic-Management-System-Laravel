import "server-only";
import { revalidatePath } from "next/cache";
import type { Prisma, StockMovementType } from "@prisma/client";
import { db } from "@/server/db";
import type { Actor } from "@/server/session";
import { audit } from "./events";

/** Stock status of a medication relative to its reorder level. */
export type StockStatus = "out" | "low" | "ok";

export function stockStatus(onHand: number, reorderLevel: number): StockStatus {
  if (onHand <= 0) return "out";
  if (onHand <= reorderLevel) return "low";
  return "ok";
}

function revalidateInventory(medicationId?: string) {
  revalidatePath("/pharmacy");
  revalidatePath("/pharmacy/inventory");
  if (medicationId) revalidatePath(`/pharmacy/inventory/${medicationId}`);
}

/* ------------------------------------------------------------------ */
/* Medications                                                         */
/* ------------------------------------------------------------------ */

export interface MedicationInput {
  name: string;
  form?: string | null;
  strength?: string | null;
  category?: string | null;
  unit?: string;
  reorderLevel?: number;
  isActive?: boolean;
}

export async function addMedication(input: MedicationInput, actor: Actor) {
  const med = await db.medication.create({
    data: {
      name: input.name.trim(),
      form: input.form?.trim() || null,
      strength: input.strength?.trim() || null,
      category: input.category?.trim() || null,
      unit: input.unit?.trim() || "unit",
      reorderLevel: input.reorderLevel ?? 20,
      isActive: input.isActive ?? true,
    },
  });
  await audit(actor.id, "medication.create", "Medication", med.id, { name: med.name });
  revalidateInventory(med.id);
  return med;
}

export async function updateMedication(id: string, input: MedicationInput, actor: Actor) {
  const med = await db.medication.update({
    where: { id },
    data: {
      name: input.name.trim(),
      form: input.form?.trim() || null,
      strength: input.strength?.trim() || null,
      category: input.category?.trim() || null,
      unit: input.unit?.trim() || "unit",
      reorderLevel: input.reorderLevel ?? 20,
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
    },
  });
  await audit(actor.id, "medication.update", "Medication", med.id, { name: med.name });
  revalidateInventory(med.id);
  return med;
}

export async function toggleMedicationActive(id: string, actor: Actor) {
  const current = await db.medication.findUniqueOrThrow({ where: { id }, select: { isActive: true } });
  const med = await db.medication.update({
    where: { id },
    data: { isActive: !current.isActive },
  });
  await audit(actor.id, med.isActive ? "medication.activate" : "medication.deactivate", "Medication", med.id);
  revalidateInventory(med.id);
  return med;
}

/* ------------------------------------------------------------------ */
/* Stock movements                                                     */
/* ------------------------------------------------------------------ */

export interface ReceiveBatchInput {
  medicationId: string;
  batchNo: string;
  expiryDate: Date;
  quantity: number;
  costPrice?: number;
  sellPrice?: number;
  supplierId?: string | null;
}

/** Receive a new stock batch (goods-in): creates the batch + a RECEIVE movement. */
export async function receiveStockBatch(input: ReceiveBatchInput, actor: Actor) {
  if (input.quantity <= 0) throw new Error("Quantity must be greater than zero");

  const batch = await db.$transaction(async (tx) => {
    const b = await tx.medicationBatch.create({
      data: {
        medicationId: input.medicationId,
        batchNo: input.batchNo.trim(),
        expiryDate: input.expiryDate,
        quantity: input.quantity,
        costPrice: input.costPrice ?? 0,
        sellPrice: input.sellPrice ?? 0,
        supplierId: input.supplierId || null,
      },
    });
    await tx.stockMovement.create({
      data: {
        batchId: b.id,
        type: "RECEIVE",
        quantity: input.quantity,
        reason: "Goods received",
        refType: "Adjustment",
        byUserId: actor.id,
      },
    });
    return b;
  });

  revalidateInventory(input.medicationId);
  return batch;
}

export type AdjustType = Extract<StockMovementType, "ADJUST_UP" | "ADJUST_DOWN" | "EXPIRE">;

export interface AdjustBatchInput {
  batchId: string;
  type: AdjustType;
  quantity: number; // magnitude, always positive
  reason: string;
}

/**
 * Adjust a batch's on-hand quantity (stock-take correction, damage, expiry
 * write-off). Writes the StockMovement + updates the batch inside a transaction.
 */
export async function adjustBatch(input: AdjustBatchInput, actor: Actor) {
  const magnitude = Math.abs(input.quantity);
  if (magnitude <= 0) throw new Error("Quantity must be greater than zero");

  const result = await db.$transaction(async (tx) => {
    const batch = await tx.medicationBatch.findUniqueOrThrow({
      where: { id: input.batchId },
      select: { id: true, quantity: true, medicationId: true },
    });

    const isIncrease = input.type === "ADJUST_UP";
    const delta = isIncrease ? magnitude : -magnitude;
    const newQty = batch.quantity + delta;
    if (newQty < 0) {
      throw new Error(`Cannot remove ${magnitude}; only ${batch.quantity} on hand in this batch`);
    }

    await tx.medicationBatch.update({
      where: { id: batch.id },
      data: { quantity: newQty },
    });
    await tx.stockMovement.create({
      data: {
        batchId: batch.id,
        type: input.type,
        quantity: delta, // signed: +in, -out
        reason: input.reason.trim() || null,
        refType: "Adjustment",
        byUserId: actor.id,
      },
    });
    return batch.medicationId;
  });

  revalidateInventory(result);
  return { medicationId: result };
}

/* ------------------------------------------------------------------ */
/* Queries                                                             */
/* ------------------------------------------------------------------ */

export interface MedicationWithStock {
  id: string;
  name: string;
  form: string | null;
  strength: string | null;
  category: string | null;
  unit: string;
  reorderLevel: number;
  isActive: boolean;
  onHand: number;
  batchCount: number;
  sellPrice: number; // representative (latest received) sell price
  stockValue: number; // onHand * sellPrice across batches
  soonestExpiry: Date | null;
  status: StockStatus;
}

/** Every medication with total on-hand across batches and a low/ok/out status. */
export async function listMedicationsWithStock(q?: string): Promise<MedicationWithStock[]> {
  const term = q?.trim();
  const meds = await db.medication.findMany({
    where: term
      ? {
          OR: [
            { name: { contains: term, mode: "insensitive" } },
            { category: { contains: term, mode: "insensitive" } },
            { strength: { contains: term, mode: "insensitive" } },
            { form: { contains: term, mode: "insensitive" } },
          ],
        }
      : undefined,
    include: { batches: { orderBy: { receivedAt: "desc" } } },
    orderBy: { name: "asc" },
  });

  return meds.map((m) => {
    const onHand = m.batches.reduce((s, b) => s + b.quantity, 0);
    const stockValue = m.batches.reduce((s, b) => s + b.quantity * b.sellPrice, 0);
    const withStock = m.batches.filter((b) => b.quantity > 0);
    const soonestExpiry = withStock.length
      ? withStock.reduce((min, b) => (b.expiryDate < min ? b.expiryDate : min), withStock[0].expiryDate)
      : null;
    const sellPrice = m.batches[0]?.sellPrice ?? 0;
    return {
      id: m.id,
      name: m.name,
      form: m.form,
      strength: m.strength,
      category: m.category,
      unit: m.unit,
      reorderLevel: m.reorderLevel,
      isActive: m.isActive,
      onHand,
      batchCount: m.batches.length,
      sellPrice,
      stockValue,
      soonestExpiry,
      status: stockStatus(onHand, m.reorderLevel),
    };
  });
}

export type MedicationDetail = Prisma.MedicationGetPayload<{
  include: {
    batches: { include: { supplier: true } };
  };
}> & {
  onHand: number;
  stockValueSell: number;
  stockValueCost: number;
  status: StockStatus;
  movements: Prisma.StockMovementGetPayload<{
    include: { batch: true; byUser: { select: { id: true; name: true } } };
  }>[];
};

/** Full detail for one medication: batches, valuation, and recent movements. */
export async function medicationDetail(id: string): Promise<MedicationDetail | null> {
  const med = await db.medication.findUnique({
    where: { id },
    include: {
      batches: {
        include: { supplier: true },
        orderBy: [{ expiryDate: "asc" }, { receivedAt: "desc" }],
      },
    },
  });
  if (!med) return null;

  const batchIds = med.batches.map((b) => b.id);
  const movements = batchIds.length
    ? await db.stockMovement.findMany({
        where: { batchId: { in: batchIds } },
        include: { batch: true, byUser: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
        take: 50,
      })
    : [];

  const onHand = med.batches.reduce((s, b) => s + b.quantity, 0);
  const stockValueSell = med.batches.reduce((s, b) => s + b.quantity * b.sellPrice, 0);
  const stockValueCost = med.batches.reduce((s, b) => s + b.quantity * b.costPrice, 0);

  return {
    ...med,
    onHand,
    stockValueSell,
    stockValueCost,
    status: stockStatus(onHand, med.reorderLevel),
    movements,
  };
}

/** Batches with stock that expire within `days` days (soonest first). */
export async function expiringBatches(days = 60) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() + days);
  return db.medicationBatch.findMany({
    where: { quantity: { gt: 0 }, expiryDate: { lte: cutoff } },
    include: { medication: true, supplier: true },
    orderBy: { expiryDate: "asc" },
  });
}

export interface StockValuation {
  sell: number;
  cost: number;
  units: number;
  margin: number; // sell - cost
}

/** Σ quantity*sellPrice and Σ quantity*costPrice across all batches. */
export async function stockValuation(): Promise<StockValuation> {
  const batches = await db.medicationBatch.findMany({
    where: { quantity: { gt: 0 } },
    select: { quantity: true, sellPrice: true, costPrice: true },
  });
  const sell = batches.reduce((s, b) => s + b.quantity * b.sellPrice, 0);
  const cost = batches.reduce((s, b) => s + b.quantity * b.costPrice, 0);
  const units = batches.reduce((s, b) => s + b.quantity, 0);
  return { sell, cost, units, margin: sell - cost };
}

/* ------------------------------------------------------------------ */
/* Suppliers                                                           */
/* ------------------------------------------------------------------ */

export interface SupplierInput {
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
}

export async function listSuppliers(q?: string) {
  const term = q?.trim();
  const suppliers = await db.supplier.findMany({
    where: term
      ? {
          OR: [
            { name: { contains: term, mode: "insensitive" } },
            { phone: { contains: term, mode: "insensitive" } },
            { email: { contains: term, mode: "insensitive" } },
          ],
        }
      : undefined,
    include: { _count: { select: { batches: true } } },
    orderBy: { name: "asc" },
  });
  return suppliers;
}

export async function addSupplier(input: SupplierInput, actor: Actor) {
  const supplier = await db.supplier.create({
    data: {
      name: input.name.trim(),
      phone: input.phone?.trim() || null,
      email: input.email?.trim() || null,
      address: input.address?.trim() || null,
    },
  });
  await audit(actor.id, "supplier.create", "Supplier", supplier.id, { name: supplier.name });
  revalidatePath("/pharmacy/suppliers");
  return supplier;
}

export async function updateSupplier(id: string, input: SupplierInput, actor: Actor) {
  const supplier = await db.supplier.update({
    where: { id },
    data: {
      name: input.name.trim(),
      phone: input.phone?.trim() || null,
      email: input.email?.trim() || null,
      address: input.address?.trim() || null,
    },
  });
  await audit(actor.id, "supplier.update", "Supplier", supplier.id, { name: supplier.name });
  revalidatePath("/pharmacy/suppliers");
  return supplier;
}

/** Suppliers as lightweight options for select inputs. */
export async function supplierOptions() {
  return db.supplier.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } });
}
