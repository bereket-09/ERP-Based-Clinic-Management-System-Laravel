import "server-only";
import { revalidatePath } from "next/cache";
import { ChargeCategory, PaymentMethod, type InvoiceState } from "@prisma/client";
import { db } from "@/server/db";
import {
  availableTransitions,
  invoiceMachine,
  resolveTransition,
  type InvoiceEvent,
} from "@/server/fsm";
import type { Actor } from "@/server/session";
import { makeCode } from "./ids";
import { logTransition, notifyRole } from "./events";

const CONSULTATION_FEE_KEY = "billing.consultationFee";
const DEFAULT_CONSULTATION_FEE = 50;

// ── Consultation fee (Setting) ────────────────────────────────────────────────

/** Current consultation fee from Setting "billing.consultationFee" (default 50). */
export async function getConsultationFee(): Promise<number> {
  const row = await db.setting.findUnique({ where: { key: CONSULTATION_FEE_KEY } });
  const value = row?.value;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_CONSULTATION_FEE;
}

/** Set the clinic's consultation fee. */
export async function setConsultationFee(fee: number): Promise<void> {
  const value = Math.max(0, Math.round(fee * 100) / 100);
  await db.setting.upsert({
    where: { key: CONSULTATION_FEE_KEY },
    create: { key: CONSULTATION_FEE_KEY, value },
    update: { value },
  });
  revalidatePath("/billing");
}

// ── Invoice generation ────────────────────────────────────────────────────────

/**
 * Build a DRAFT invoice from a visit: one consultation line, one line per lab
 * item (test price) and one per drug item (latest batch sell price × qty).
 * Idempotent — if the visit already has an invoice it is returned untouched.
 */
export async function generateInvoiceForVisit(visitId: string, actor: Actor) {
  const existing = await db.invoice.findFirst({ where: { visitId } });
  if (existing) return existing;

  const visit = await db.visit.findUnique({
    where: { id: visitId },
    include: {
      patient: true,
      labOrders: { include: { items: { include: { test: true } } } },
      drugOrders: {
        include: {
          items: {
            include: {
              medication: {
                include: { batches: { orderBy: { receivedAt: "desc" } } },
              },
            },
          },
        },
      },
    },
  });
  if (!visit) throw new Error("Visit not found");

  const fee = await getConsultationFee();

  const items: {
    description: string;
    category: ChargeCategory;
    quantity: number;
    unitPrice: number;
    amount: number;
    refType?: string;
    refId?: string;
  }[] = [];

  // Consultation
  items.push({
    description: "Consultation fee",
    category: ChargeCategory.CONSULTATION,
    quantity: 1,
    unitPrice: fee,
    amount: fee,
  });

  // Labs — one line per ordered test
  for (const order of visit.labOrders) {
    for (const it of order.items) {
      const price = it.test.price ?? 0;
      items.push({
        description: it.test.name,
        category: ChargeCategory.LAB,
        quantity: 1,
        unitPrice: price,
        amount: price,
        refType: "LabOrderItem",
        refId: it.id,
      });
    }
  }

  // Pharmacy — one line per prescribed drug item
  for (const order of visit.drugOrders) {
    for (const it of order.items) {
      const price = it.medication.batches[0]?.sellPrice ?? 0;
      const qty = it.quantity ?? 0;
      const amount = qty * price;
      const label = [it.medication.name, it.medication.strength, it.medication.form]
        .filter(Boolean)
        .join(" ");
      items.push({
        description: label || it.medication.name,
        category: ChargeCategory.PHARMACY,
        quantity: qty,
        unitPrice: price,
        amount,
        refType: "DrugOrderItem",
        refId: it.id,
      });
    }
  }

  const total = items.reduce((s, i) => s + i.amount, 0);
  const seq = (await db.invoice.count()) + 1;

  const invoice = await db.invoice.create({
    data: {
      invoiceNo: makeCode("INV", seq),
      state: "DRAFT",
      patientId: visit.patientId,
      visitId: visit.id,
      createdById: actor.id,
      total,
      paid: 0,
      items: { create: items },
    },
  });

  revalidatePath("/billing");
  revalidatePath(`/billing/${invoice.id}`);
  return invoice;
}

// ── Invoice state machine ─────────────────────────────────────────────────────

/** Affordances (available actions) for an invoice given the actor's role. */
export function invoiceAffordances(state: string, actor: Actor) {
  return availableTransitions(invoiceMachine, state as never, { role: actor.role });
}

/** Advance an invoice through a lifecycle event (issue / void). */
export async function transitionInvoice(id: string, event: InvoiceEvent, actor: Actor) {
  const invoice = await db.invoice.findUnique({ where: { id } });
  if (!invoice) throw new Error("Invoice not found");

  // FSM gate — throws FsmError if illegal or unauthorized.
  const { to } = resolveTransition(invoiceMachine, invoice.state, event, { role: actor.role });

  await db.$transaction(async (tx) => {
    await tx.invoice.update({ where: { id }, data: { state: to } });
    await logTransition(tx, {
      entityType: "Invoice",
      entityId: id,
      event,
      from: invoice.state,
      to,
      actorId: actor.id,
    });
  });

  revalidatePath("/billing");
  revalidatePath(`/billing/${id}`);
  return { to };
}

// ── Payments ──────────────────────────────────────────────────────────────────

export interface RecordPaymentInput {
  amount: number;
  method: PaymentMethod;
  reference?: string;
}

/**
 * Record a payment against an issued invoice. Increments `paid`; settles the
 * invoice (PAID) once fully covered, otherwise marks it PARTIALLY_PAID. All
 * mutations are transactional and validated through the invoice machine.
 */
export async function recordPayment(
  invoiceId: string,
  input: RecordPaymentInput,
  actor: Actor,
) {
  const amount = Math.round(input.amount * 100) / 100;
  if (!Number.isFinite(amount) || amount <= 0) throw new Error("Enter a valid amount");

  const result = await db.$transaction(async (tx) => {
    const invoice = await tx.invoice.findUnique({ where: { id: invoiceId } });
    if (!invoice) throw new Error("Invoice not found");
    if (invoice.state !== "ISSUED" && invoice.state !== "PARTIALLY_PAID") {
      throw new Error("Invoice is not open for payment");
    }

    const newPaid = Math.round((invoice.paid + amount) * 100) / 100;
    const fullyPaid = newPaid >= invoice.total;

    // Resolve the lifecycle event (validates state + role). A repeat partial
    // payment on an already PARTIALLY_PAID invoice keeps the same state.
    let to: InvoiceState = invoice.state;
    if (fullyPaid) {
      ({ to } = resolveTransition(invoiceMachine, invoice.state, "settle", { role: actor.role }));
    } else if (invoice.state === "ISSUED") {
      ({ to } = resolveTransition(invoiceMachine, invoice.state, "record_partial", { role: actor.role }));
    }

    await tx.payment.create({
      data: {
        invoiceId,
        amount,
        method: input.method,
        reference: input.reference?.trim() || null,
        receivedById: actor.id,
      },
    });

    await tx.invoice.update({ where: { id: invoiceId }, data: { paid: newPaid, state: to } });

    await logTransition(tx, {
      entityType: "Invoice",
      entityId: invoiceId,
      event: fullyPaid ? "settle" : "record_partial",
      from: invoice.state,
      to,
      actorId: actor.id,
      note: `Payment ${amount} via ${input.method}`,
    });

    await notifyRole(tx, "MANAGER", {
      type: "GENERIC",
      title: fullyPaid ? "Invoice settled" : "Payment received",
      body: `${invoice.invoiceNo}: ETB ${amount.toFixed(2)} via ${input.method}`,
      link: `/billing/${invoiceId}`,
    });

    return { to, paid: newPaid, fullyPaid };
  });

  revalidatePath("/billing");
  revalidatePath(`/billing/${invoiceId}`);
  return result;
}
