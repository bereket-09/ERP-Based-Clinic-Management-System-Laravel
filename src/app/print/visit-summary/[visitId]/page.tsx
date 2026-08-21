import { notFound } from "next/navigation";
import { format } from "date-fns";
import { requireStaff } from "@/server/session";
import { db } from "@/server/db";
import { getBranding } from "@/server/services/settings";
import { getOrIssueForVisit } from "@/server/services/documents";
import { qrDataUrl, verifyUrlFor } from "@/server/services/qr";
import { formatVerifyCode } from "@/server/services/document-signing";
import { humanize } from "@/lib/utils";
import { Letterhead, Field, SignatureLine, DocFooter, VerifySeal } from "@/components/print/letterhead";

function age(d?: Date | null) {
  if (!d) return null;
  return Math.floor((Date.now() - d.getTime()) / 3.15576e10);
}

export const metadata = { title: "Visit summary" };

export default async function VisitSummaryPrint({ params }: { params: Promise<{ visitId: string }> }) {
  const actor = await requireStaff();
  const { visitId } = await params;

  const visit = await db.visit.findUnique({
    where: { id: visitId },
    include: {
      patient: true,
      doctor: { select: { name: true, title: true, speciality: true } },
      vitals: { orderBy: { createdAt: "desc" }, take: 1 },
      labOrders: { include: { items: { include: { test: true } } }, orderBy: { createdAt: "asc" } },
      drugOrders: { include: { items: { include: { medication: true } } }, orderBy: { createdAt: "asc" } },
    },
  });
  if (!visit) notFound();

  const [branding, doc] = await Promise.all([
    getBranding(),
    getOrIssueForVisit("VISIT_SUMMARY", { visitId: visit.id, patientId: visit.patientId }, actor),
  ]);

  const p = visit.patient;
  const v = visit.vitals[0];
  const labItems = visit.labOrders.flatMap((o) => o.items);
  const drugItems = visit.drugOrders.flatMap((o) => o.items);
  const doctorName = visit.doctor ? `${visit.doctor.title ? visit.doctor.title + " " : ""}${visit.doctor.name}` : null;

  const verifyUrl = doc.verifyCode ? await verifyUrlFor(doc.verifyCode) : null;
  const seal = doc.verifyCode && verifyUrl
    ? { code: formatVerifyCode(doc.verifyCode), url: verifyUrl, qr: await qrDataUrl(verifyUrl, 160) }
    : null;

  return (
    <article className="space-y-5">
      <Letterhead branding={branding} contact="Visit Summary / After-Visit Report" />

      <div className="text-center">
        <h1 className="font-serif text-xl font-bold uppercase tracking-wide text-slate-900">Visit Summary</h1>
        <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">After-visit report</p>
      </div>

      <section className="grid grid-cols-2 gap-4 rounded-md border border-slate-200 bg-slate-50 p-4 sm:grid-cols-4">
        <Field label="Patient" value={p.name} />
        <Field label="MRN" value={p.mrn} />
        <Field label="Student ID" value={p.studentId} />
        <Field label="Age / Sex" value={[age(p.birthday), p.gender].filter(Boolean).join(" / ") || null} />
        <Field label="Visit No." value={visit.visitNo} />
        <Field label="Date" value={format(visit.openedAt, "dd MMM yyyy")} />
        <Field label="Attending" value={doctorName} />
        <Field label="Status" value={humanize(visit.state)} />
      </section>

      {(visit.chiefComplaint || visit.symptoms) && (
        <Block title="Presenting complaint">
          {visit.chiefComplaint && <p>{visit.chiefComplaint}</p>}
          {visit.symptoms && <p className="text-slate-600">{visit.symptoms}</p>}
        </Block>
      )}

      {(visit.diagnosis || visit.disease || visit.icdCode) && (
        <Block title="Assessment / Diagnosis">
          {visit.diagnosis && <p className="font-medium">{visit.diagnosis}</p>}
          {visit.disease && <p>{visit.disease}</p>}
          {visit.icdCode && <p className="text-slate-500">ICD: {visit.icdCode}</p>}
        </Block>
      )}

      {v && (
        <Block title="Vitals">
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            <Mini label="Temp" value={v.temperatureC != null ? `${v.temperatureC}°C` : "—"} />
            <Mini label="Pulse" value={v.pulseBpm != null ? `${v.pulseBpm}` : "—"} />
            <Mini label="BP" value={v.systolic != null ? `${v.systolic}/${v.diastolic ?? "—"}` : "—"} />
            <Mini label="SpO₂" value={v.spo2 != null ? `${v.spo2}%` : "—"} />
            <Mini label="Resp" value={v.respRate != null ? `${v.respRate}` : "—"} />
            <Mini label="Weight" value={v.weightKg != null ? `${v.weightKg}kg` : "—"} />
          </div>
        </Block>
      )}

      {labItems.length > 0 && (
        <Block title="Laboratory investigations">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-slate-200 text-left text-[10px] uppercase tracking-wide text-slate-500">
                <th className="py-1">Test</th><th className="py-1">Result</th><th className="py-1">Unit</th><th className="py-1">Flag</th>
              </tr>
            </thead>
            <tbody>
              {labItems.map((it) => (
                <tr key={it.id} className="border-b border-slate-100">
                  <td className="py-1 text-slate-800">{it.test.name}</td>
                  <td className="py-1 font-medium text-slate-900">{it.resultValue ?? "—"}</td>
                  <td className="py-1 text-slate-500">{it.test.unit ?? ""}</td>
                  <td className="py-1 text-slate-700">{it.resultFlag ? humanize(it.resultFlag) : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Block>
      )}

      {drugItems.length > 0 && (
        <Block title="Medications prescribed">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-slate-200 text-left text-[10px] uppercase tracking-wide text-slate-500">
                <th className="py-1">Medication</th><th className="py-1">Dose</th><th className="py-1">Frequency</th><th className="py-1">Duration</th><th className="py-1">Qty</th>
              </tr>
            </thead>
            <tbody>
              {drugItems.map((it) => (
                <tr key={it.id} className="border-b border-slate-100">
                  <td className="py-1 text-slate-800">{[it.medication.name, it.medication.strength].filter(Boolean).join(" ")}</td>
                  <td className="py-1 text-slate-700">{it.dose ?? "—"}</td>
                  <td className="py-1 text-slate-700">{it.frequency ?? "—"}</td>
                  <td className="py-1 text-slate-700">{it.duration ?? "—"}</td>
                  <td className="py-1 text-slate-700">{it.quantity || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Block>
      )}

      <div className="flex items-end justify-between pt-6">
        {seal ? <VerifySeal qrDataUrl={seal.qr} code={seal.code} url={seal.url} /> : <div />}
        <SignatureLine name={doctorName} role={visit.doctor?.speciality ?? "Attending Physician"} label="Attending physician" />
      </div>

      <DocFooter docNo={doc.docNo} issuedAt={doc.issuedAt} />
    </article>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-1">
      <h2 className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{title}</h2>
      <div className="space-y-1 text-[13px] leading-6 text-slate-800">{children}</div>
    </section>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-slate-200 bg-slate-50 px-2 py-1">
      <div className="text-[9px] uppercase tracking-wide text-slate-500">{label}</div>
      <div className="text-[13px] font-semibold text-slate-900">{value}</div>
    </div>
  );
}
