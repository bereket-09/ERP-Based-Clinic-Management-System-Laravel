import { InvoiceState } from "@prisma/client";
import { defineMachine } from "../engine";

export type InvoiceEvent = "issue" | "record_partial" | "settle" | "void";

export const invoiceMachine = defineMachine<InvoiceState, InvoiceEvent>({
  entity: "Invoice",
  initial: InvoiceState.DRAFT,
  states: Object.values(InvoiceState),
  final: [InvoiceState.PAID, InvoiceState.VOID],
  transitions: [
    { event: "issue", from: InvoiceState.DRAFT, to: InvoiceState.ISSUED, roles: ["RECEPTIONIST", "MANAGER"], label: "Issue invoice", intent: "primary" },
    { event: "record_partial", from: InvoiceState.ISSUED, to: InvoiceState.PARTIALLY_PAID, roles: ["RECEPTIONIST", "MANAGER"], label: "Record part-payment" },
    { event: "settle", from: [InvoiceState.ISSUED, InvoiceState.PARTIALLY_PAID], to: InvoiceState.PAID, roles: ["RECEPTIONIST", "MANAGER"], label: "Mark paid", intent: "success" },
    { event: "void", from: [InvoiceState.DRAFT, InvoiceState.ISSUED, InvoiceState.PARTIALLY_PAID], to: InvoiceState.VOID, roles: ["MANAGER"], label: "Void", intent: "danger" },
  ],
});
