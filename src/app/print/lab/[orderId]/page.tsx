import { notFound } from "next/navigation";
import { format } from "date-fns";
import { requireStaff } from "@/server/session";
import { db } from "@/server/db";
import { getBranding } from "@/server/services/settings";
import { humanize } from "@/lib/utils";
import { Letterhead, Field, SignatureLine, DocFooter } from "@/components/print/letterhead";

function age(d?: Date | null) {
  if (!d) return null;
  return Math.floor((Date.now() - d.getTime()) / 3.15576e10);
}

export default async function LabReportPrint({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  await requireStaff();
  const { orderId } = await params;

  const [order, branding] = await Promise.all([
    db.labOrder.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            test: true,
            resultedBy: { select: { name: true, title: true } },
          },
        },
        visit: { include: { patient: true } },
        orderedBy: { select: { name: true, title: true } },
      },
    }),
    getBranding(),
  ]);
  if (!order) notFound();

  const patient = order.visit.patient;
  const verifier = order.items.find((it) => it.resultedBy)?.resultedBy;
  const technicianName = verifier
    ? `${verifier.title ? verifier.title + " " : ""}${verifier.name}`
    : null;

  return (
    <article className="space-y-6">
      <Letterhead branding={branding} contact="Laboratory Report" />

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-lg font-bold text-slate-900">Laboratory Report</h1>
          <p className="text-[11px] text-slate-500">Order {order.orderNo}</p>
        </div>
        <div className="text-right text-[11px] text-slate-600">
          <div className="font-semibold uppercase tracking-wide text-slate-500">Status</div>
          <div className="text-[13px] font-semibold text-slate-900">{humanize(order.state)}</div>
        </div>
      </div>

      <section className="grid grid-cols-2 gap-4 rounded-md border border-slate-200 bg-slate-50 p-4 sm:grid-cols-4">
        <Field label="Patient" value={patient.name} />
        <Field label="MRN" value={patient.mrn} />
        <Field label="Age / Sex" value={[age(patient.birthday), patient.gender].filter(Boolean).join(" / ") || null} />
        <Field label="Visit" value={order.visit.visitNo} />
      </section>

      <section>
        <table className="w-full border-collapse text-[12px]">
          <thead>
            <tr className="border-b-2 border-slate-300 text-left text-[10px] uppercase tracking-wide text-slate-500">
              <th className="py-2 pr-2">Test</th>
              <th className="py-2 pr-2">Result</th>
              <th className="py-2 pr-2">Unit</th>
              <th className="py-2 pr-2">Reference range</th>
              <th className="py-2 pr-2">Flag</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((it) => {
              const range =
                it.test.refRangeText ??
                (it.test.refRangeLow != null && it.test.refRangeHigh != null
                  ? `${it.test.refRangeLow}–${it.test.refRangeHigh}`
                  : "—");
              const abnormal = it.resultFlag && it.resultFlag !== "NORMAL";
              return (
                <tr key={it.id} className="border-b border-slate-100 align-top">
                  <td className="py-2 pr-2 font-medium text-slate-900">{it.test.name}</td>
                  <td className={`py-2 pr-2 font-mono ${abnormal ? "font-bold text-slate-900" : "text-slate-800"}`}>
                    {it.resultValue ?? "pending"}
                  </td>
                  <td className="py-2 pr-2 text-slate-600">{it.test.unit ?? "—"}</td>
                  <td className="py-2 pr-2 text-slate-600">{range}</td>
                  <td className="py-2 pr-2">
                    {it.resultFlag ? (
                      <span className={abnormal ? "font-semibold text-slate-900" : "text-slate-500"}>
                        {humanize(it.resultFlag)}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              );
            })}
            {order.items.length === 0 && (
              <tr>
                <td colSpan={5} className="py-4 text-center text-slate-400">
                  No tests on this order.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {order.notes && (
        <section>
          <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Notes</div>
          <p className="text-[12px] text-slate-700">{order.notes}</p>
        </section>
      )}

      <div className="flex items-end justify-between pt-8">
        <div className="text-[11px] text-slate-500">
          Reported: {format(order.updatedAt, "dd MMM yyyy")}
        </div>
        <SignatureLine name={technicianName} role="Laboratory Technician" label="Verified by" />
      </div>

      <DocFooter docNo={order.orderNo} issuedAt={order.createdAt} />
    </article>
  );
}
