import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, Receipt, Printer, Stethoscope } from "lucide-react";
import type { ChargeCategory } from "@prisma/client";
import { requireRole } from "@/server/session";
import { db } from "@/server/db";
import { invoiceAffordances } from "@/server/services/billing";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { humanize } from "@/lib/utils";
import { formatETB } from "@/lib/money";
import { BillingActions } from "./billing-actions";

const CATEGORY_ORDER: ChargeCategory[] = [
  "CONSULTATION",
  "LAB",
  "PHARMACY",
  "PROCEDURE",
  "WARD",
  "OTHER",
];

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const actor = await requireRole("RECEPTIONIST", "MANAGER");
  const { id } = await params;

  const invoice = await db.invoice.findUnique({
    where: { id },
    include: {
      patient: true,
      visit: true,
      createdBy: { select: { name: true, title: true } },
      items: true,
      payments: {
        include: { receivedBy: { select: { name: true, title: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!invoice) notFound();

  const balance = invoice.total - invoice.paid;
  const affordances = invoiceAffordances(invoice.state, actor);
  const canPay =
    (invoice.state === "ISSUED" || invoice.state === "PARTIALLY_PAID") && balance > 0;

  const groups = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    items: invoice.items.filter((i) => i.category === cat),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="space-y-6">
      <Link
        href="/billing"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Billing
      </Link>

      {/* Banner */}
      <Card>
        <CardContent className="flex flex-wrap items-start justify-between gap-4 p-5">
          <div>
            <div className="flex items-center gap-2">
              <Link
                href={`/patients/${invoice.patientId}`}
                className="text-lg font-semibold hover:text-primary"
              >
                {invoice.patient.name}
              </Link>
              <StatusBadge state={invoice.state} />
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
              <span>{invoice.patient.mrn}</span>
              <span>·</span>
              <span className="font-mono">{invoice.invoiceNo}</span>
              <span>·</span>
              <span>{format(invoice.createdAt, "PP p")}</span>
              {invoice.visit && (
                <>
                  <span>·</span>
                  <Link
                    href={`/visits/${invoice.visitId}`}
                    className="inline-flex items-center gap-1 hover:text-primary"
                  >
                    <Stethoscope className="size-3.5" /> {invoice.visit.visitNo}
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/print/receipt/${invoice.id}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              <Printer className="size-4" /> Print receipt
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Charges */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader className="flex-row items-center gap-2">
              <Receipt className="size-4 text-primary" />
              <CardTitle>Charges</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {groups.map((g) => {
                const subtotal = g.items.reduce((s, i) => s + i.amount, 0);
                return (
                  <div key={g.category}>
                    <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {humanize(g.category)}
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border text-left text-xs text-muted-foreground">
                            <th className="py-1.5 pr-2 font-medium">Description</th>
                            <th className="py-1.5 px-2 text-right font-medium">Qty</th>
                            <th className="py-1.5 px-2 text-right font-medium">Unit price</th>
                            <th className="py-1.5 pl-2 text-right font-medium">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {g.items.map((it) => (
                            <tr key={it.id} className="border-b border-border/60 last:border-0">
                              <td className="py-1.5 pr-2">{it.description}</td>
                              <td className="py-1.5 px-2 text-right tabular-nums">{it.quantity}</td>
                              <td className="py-1.5 px-2 text-right tabular-nums">
                                {formatETB(it.unitPrice)}
                              </td>
                              <td className="py-1.5 pl-2 text-right tabular-nums">
                                {formatETB(it.amount)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td colSpan={3} className="py-1.5 pr-2 text-right text-xs text-muted-foreground">
                              {humanize(g.category)} subtotal
                            </td>
                            <td className="py-1.5 pl-2 text-right font-medium tabular-nums">
                              {formatETB(subtotal)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                );
              })}
              {groups.length === 0 && (
                <EmptyState title="No line items" icon={Receipt} />
              )}
            </CardContent>
          </Card>

          {/* Payments */}
          <Card>
            <CardHeader>
              <CardTitle>Payments</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {invoice.payments.length === 0 ? (
                <EmptyState title="No payments recorded yet" icon={Receipt} className="m-4" />
              ) : (
                <div className="divide-y divide-border">
                  {invoice.payments.map((p) => (
                    <div key={p.id} className="flex items-center justify-between gap-3 px-4 py-3">
                      <div>
                        <div className="font-medium tabular-nums">ETB {formatETB(p.amount)}</div>
                        <div className="text-xs text-muted-foreground">
                          {humanize(p.method)}
                          {p.reference ? ` · ${p.reference}` : ""} ·{" "}
                          {format(p.createdAt, "PP p")}
                          {p.receivedBy ? ` · ${p.receivedBy.name}` : ""}
                        </div>
                      </div>
                      <StatusBadge state={p.method} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Summary + actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total</span>
                <span className="font-medium tabular-nums">ETB {formatETB(invoice.total)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Paid</span>
                <span className="font-medium tabular-nums text-success">
                  ETB {formatETB(invoice.paid)}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-3">
                <span className="font-medium">Balance due</span>
                <span className="text-lg font-semibold tabular-nums">
                  ETB {formatETB(balance)}
                </span>
              </div>
              {invoice.createdBy && (
                <div className="pt-1 text-xs text-muted-foreground">
                  Raised by {invoice.createdBy.name}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent>
              {affordances.length === 0 && !canPay ? (
                <p className="text-sm text-muted-foreground">
                  No actions available for this invoice.
                </p>
              ) : (
                <BillingActions
                  invoiceId={invoice.id}
                  balance={balance}
                  canPay={canPay}
                  affordances={affordances}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
