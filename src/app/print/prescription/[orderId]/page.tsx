import { notFound } from "next/navigation";
import { requireStaff } from "@/server/session";
import { db } from "@/server/db";
import { getBranding } from "@/server/services/settings";
import { Letterhead, Field, SignatureLine, DocFooter } from "@/components/print/letterhead";

function age(d?: Date | null) {
  if (!d) return null;
  return Math.floor((Date.now() - d.getTime()) / 3.15576e10);
}

export default async function PrescriptionPrint({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  await requireStaff();
  const { orderId } = await params;

  const [order, branding] = await Promise.all([
    db.drugOrder.findUnique({
      where: { id: orderId },
      include: {
        items: { include: { medication: true } },
        visit: { include: { patient: true } },
        prescribedBy: { select: { name: true, title: true, speciality: true } },
      },
    }),
    getBranding(),
  ]);
  if (!order) notFound();

  const patient = order.visit.patient;
  const prescriberName = order.prescribedBy
    ? `${order.prescribedBy.title ? order.prescribedBy.title + " " : ""}${order.prescribedBy.name}`
    : null;

  return (
    <article className="space-y-6">
      <Letterhead branding={branding} contact="Outpatient Pharmacy — Prescription" />

      <div className="flex items-center gap-3">
        <span className="font-serif text-4xl font-bold leading-none text-slate-800">℞</span>
        <div>
          <h1 className="font-serif text-lg font-bold text-slate-900">Prescription</h1>
          <p className="text-[11px] text-slate-500">Order {order.orderNo}</p>
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
              <th className="py-2 pr-2">#</th>
              <th className="py-2 pr-2">Medication</th>
              <th className="py-2 pr-2">Dose</th>
              <th className="py-2 pr-2">Frequency</th>
              <th className="py-2 pr-2">Duration</th>
              <th className="py-2 pr-2 text-right">Qty</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((it, i) => (
              <tr key={it.id} className="border-b border-slate-100 align-top">
                <td className="py-2 pr-2 text-slate-500">{i + 1}</td>
                <td className="py-2 pr-2">
                  <div className="font-semibold text-slate-900">
                    {it.medication.name} {it.medication.strength}
                  </div>
                  <div className="text-[11px] text-slate-500">{it.medication.form}</div>
                  {it.instructions && (
                    <div className="text-[11px] italic text-slate-600">{it.instructions}</div>
                  )}
                </td>
                <td className="py-2 pr-2">{it.dose || "—"}</td>
                <td className="py-2 pr-2">{it.frequency || "—"}</td>
                <td className="py-2 pr-2">{it.duration || "—"}</td>
                <td className="py-2 pr-2 text-right font-medium">{it.quantity}</td>
              </tr>
            ))}
            {order.items.length === 0 && (
              <tr>
                <td colSpan={6} className="py-4 text-center text-slate-400">
                  No medications on this order.
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

      <div className="flex items-end justify-end pt-8">
        <SignatureLine
          name={prescriberName}
          role={order.prescribedBy?.speciality ?? "Prescriber"}
          label="Prescriber signature"
        />
      </div>

      <DocFooter docNo={order.orderNo} issuedAt={order.createdAt} />
    </article>
  );
}
