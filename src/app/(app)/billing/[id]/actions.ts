"use server";
import { z } from "zod";
import { PaymentMethod } from "@prisma/client";
import { requireRole } from "@/server/session";
import { FsmError } from "@/server/fsm";
import { recordPayment, transitionInvoice } from "@/server/services/billing";
import type { InvoiceEvent } from "@/server/fsm";

export interface ActionResult {
  ok: boolean;
  error?: string;
}

const paymentSchema = z.object({
  amount: z.coerce.number().positive("Enter an amount greater than zero"),
  method: z.enum(PaymentMethod),
  reference: z.string().trim().max(120).optional(),
});

export async function recordPaymentAction(
  invoiceId: string,
  input: { amount: number; method: string; reference?: string },
): Promise<ActionResult> {
  const actor = await requireRole("RECEPTIONIST", "MANAGER");
  const parsed = paymentSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid payment" };
  }
  try {
    await recordPayment(invoiceId, parsed.data, actor);
    return { ok: true };
  } catch (err) {
    if (err instanceof FsmError) return { ok: false, error: err.message };
    return { ok: false, error: err instanceof Error ? err.message : "Payment failed" };
  }
}

export async function transitionInvoiceAction(
  invoiceId: string,
  event: InvoiceEvent,
): Promise<ActionResult> {
  const actor = await requireRole("RECEPTIONIST", "MANAGER");
  try {
    await transitionInvoice(invoiceId, event, actor);
    return { ok: true };
  } catch (err) {
    if (err instanceof FsmError) return { ok: false, error: err.message };
    return { ok: false, error: err instanceof Error ? err.message : "Action failed" };
  }
}
