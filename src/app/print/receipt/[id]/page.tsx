import { Fragment } from "react";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import type { ChargeCategory } from "@prisma/client";
import { requireStaff } from "@/server/session";
import { db } from "@/server/db";
import { getBranding } from "@/server/services/settings";
import { humanize } from "@/lib/utils";
import { formatETB } from "@/lib/money";
import { Letterhead, Field, DocFooter } from "@/components/print/letterhead";

const CATEGORY_ORDER: ChargeCategory[] = [
  "CONSULTATION",
  "LAB",
  "PHARMACY",
  "PROCEDURE",
  "WARD",
  "OTHER",
];

function age(d?: Date | null) {
  if (!d) return null;
  return Math.floor((Date.now() - d.getTime()) / 3.15576e10);
}

export default async function ReceiptPrint({ params }: { params: Promise<{ id: string }> }) {
  await requireStaff();
  const { id } = await params;

  const [invoice, branding] = await Promise.all([
    db.invoice.findUnique({
      where: { id },
      include: {
        patient: true,
        visit: { select: { visitNo: true } },
        createdBy: { select: { name: true, title: true } },
        items: true,
        payments: {
          include: { receivedBy: { select: { name: true, title: true } } },
          orderBy: { createdAt: "asc" },
        },
      },
    }),
    getBranding(),
  ]);
  if (!invoice) notFound();

  const p = invoice.patient;
  const balance = invoice.total - invoice.paid;
  const lastPayment = invoice.payments[invoice.payments.length - 1];
  const cashier = lastPayment?.receivedBy ?? invoice.createdBy;
  const cashierName = cashier
    ? `${cashier.title ? cashier.title + " " : ""}${cashier.name}`
    : null;

  const groups = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    items: invoice.items.filter((i) => i.category === cat),
  })).filter((g) => g.items.length > 0);

  return (
    <article className="space-y-6">
      <Letterhead branding={branding} contact="Payment Receipt" />

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-lg font-bold text-slate-900">Payment Receipt</h1>
          <p className="text-[11px] text-slate-500">No. {invoice.invoiceNo}</p>
        </div>
        <div className="text-right text-[11px] text-slate-600">
          <div className="font-semibold uppercase tracking-wide text-slate-500">Status</div>
          <div className="text-[13px] font-semibold text-slate-900">{humanize(invoice.state)}</div>
        </div>
      </div>

      <section className="grid grid-cols-2 gap-4 rounded-md border border-slate-200 bg-slate-50 p-4 sm:grid-cols-4">
        <Field label="Patient" value={p.name} />
        <Field label="MRN" value={p.mrn} />
        <Field label="Age / Sex" value={[age(p.birthday), p.gender].filter(Boolean).join(" / ") || null} />
        <Field label="Date" value={format(invoice.createdAt, "dd MMM yyyy")} />
        {invoice.visit && <Field label="Visit" value={invoice.visit.visitNo} />}
      </section>

      <section>
        <table className="w-full border-collapse text-[12px]">
          <thead>
            <tr className="border-b-2 border-slate-300 text-left text-[10px] uppercase tracking-wide text-slate-500">
              <th className="py-2 pr-2">Description</th>
              <th className="py-2 px-2 text-right">Qty</th>
              <th className="py-2 px-2 text-right">Unit price</th>
              <th className="py-2 pl-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((g) => (
              <Fragment key={g.category}>
                <tr>
                  <td
                    colSpan={4}
                    className="pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500"
                  >
                    {humanize(g.category)}
                  </td>
                </tr>
                {g.items.map((it) => (
                  <tr key={it.id} className="border-b border-slate-100 align-top">
                    <td className="py-1.5 pr-2 text-slate-800">{it.description}</td>
                    <td className="py-1.5 px-2 text-right tabular-nums text-slate-700">
                      {it.quantity}
                    </td>
                    <td className="py-1.5 px-2 text-right tabular-nums text-slate-700">
                      {formatETB(it.unitPrice)}
                    </td>
                    <td className="py-1.5 pl-2 text-right tabular-nums text-slate-900">
                      {formatETB(it.amount)}
                    </td>
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </section>

      <section className="flex justify-end">
        <div className="w-full max-w-[280px] space-y-1.5 text-[13px]">
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Total (ETB)</span>
            <span className="font-semibold tabular-nums text-slate-900">{formatETB(invoice.total)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Amount paid (ETB)</span>
            <span className="font-semibold tabular-nums text-slate-900">{formatETB(invoice.paid)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-slate-300 pt-1.5">
            <span className="font-semibold text-slate-900">Balance due (ETB)</span>
            <span className="text-[15px] font-bold tabular-nums text-slate-900">
              {formatETB(balance)}
            </span>
          </div>
        </div>
      </section>

      {invoice.payments.length > 0 && (
        <section>
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Payments
          </div>
          <table className="w-full border-collapse text-[12px]">
            <tbody>
              {invoice.payments.map((pay) => (
                <tr key={pay.id} className="border-b border-slate-100">
                  <td className="py-1.5 pr-2 text-slate-700">{format(pay.createdAt, "dd MMM yyyy p")}</td>
                  <td className="py-1.5 px-2 text-slate-700">{humanize(pay.method)}</td>
                  <td className="py-1.5 px-2 text-slate-600">{pay.reference ?? "—"}</td>
                  <td className="py-1.5 pl-2 text-right tabular-nums text-slate-900">
                    {formatETB(pay.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <div className="flex items-end justify-between pt-8">
        <div className="text-[11px] text-slate-500">
          Cashier: <span className="font-medium text-slate-700">{cashierName ?? "—"}</span>
        </div>
        <div className="text-[11px] text-slate-500">
          Printed: {format(new Date(), "dd MMM yyyy p")}
        </div>
      </div>

      <DocFooter docNo={invoice.invoiceNo} issuedAt={invoice.createdAt} />
    </article>
  );
}
