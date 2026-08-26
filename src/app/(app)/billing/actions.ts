"use server";
import { redirect } from "next/navigation";
import { requireRole } from "@/server/session";
import { generateInvoiceForVisit } from "@/server/services/billing";

/** Generate a draft invoice for a completed visit and open it. */
export async function generateInvoiceAction(visitId: string) {
  const actor = await requireRole("RECEPTIONIST", "MANAGER");
  const invoice = await generateInvoiceForVisit(visitId, actor);
  redirect(`/billing/${invoice.id}`);
}
