import { notFound } from "next/navigation";
import { format } from "date-fns";
import { requireStaff } from "@/server/session";
import { getBranding } from "@/server/services/settings";
import { getDocument } from "@/server/services/documents";
import { qrDataUrl, verifyUrlFor } from "@/server/services/qr";
import { formatVerifyCode } from "@/server/services/document-signing";
import { Letterhead, Field, SignatureLine, DocFooter, VerifySeal } from "@/components/print/letterhead";

function age(d?: Date | null) {
  if (!d) return null;
  return Math.floor((Date.now() - d.getTime()) / 3.15576e10);
}

interface SickLeavePayload {
  diagnosis?: string | null;
}

export default async function SickLeavePrint({ params }: { params: Promise<{ docId: string }> }) {
  await requireStaff();
  const { docId } = await params;

  const [doc, branding] = await Promise.all([getDocument(docId), getBranding()]);
  if (!doc || doc.type !== "SICK_LEAVE") notFound();

  const p = doc.patient;
  const payload = (doc.payload as SickLeavePayload | null) ?? {};
  const diagnosis = payload.diagnosis ?? doc.visit?.diagnosis ?? null;
  const doctorName = doc.issuedBy
    ? `${doc.issuedBy.title ? doc.issuedBy.title + " " : ""}${doc.issuedBy.name}`
    : null;

  const seal = doc.verifyCode
    ? {
        code: formatVerifyCode(doc.verifyCode),
        url: await verifyUrlFor(doc.verifyCode),
        qr: await qrDataUrl(await verifyUrlFor(doc.verifyCode), 160),
      }
    : null;

  return (
    <article className="space-y-6">
      <Letterhead branding={branding} contact="Medical Certificate — Sick Leave" />

      <div className="text-center">
        <h1 className="font-serif text-xl font-bold uppercase tracking-wide text-slate-900">
          Medical Certificate
        </h1>
        <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Certificate of Sick Leave</p>
      </div>

      <section className="grid grid-cols-2 gap-4 rounded-md border border-slate-200 bg-slate-50 p-4 sm:grid-cols-4">
        <Field label="Patient" value={p?.name} />
        <Field label="MRN" value={p?.mrn} />
        <Field label="Age / Sex" value={[age(p?.birthday), p?.gender].filter(Boolean).join(" / ") || null} />
        {doc.visit && <Field label="Visit" value={doc.visit.visitNo} />}
      </section>

      <section className="space-y-3 text-[14px] leading-7 text-slate-800">
        <p>
          This is to certify that <span className="font-semibold">{p?.name ?? "the patient"}</span> was
          examined at this facility and, on medical grounds, is advised to rest from{" "}
          <span className="font-semibold">
            {doc.fromDate ? format(doc.fromDate, "dd MMM yyyy") : "—"}
          </span>{" "}
          to{" "}
          <span className="font-semibold">
            {doc.toDate ? format(doc.toDate, "dd MMM yyyy") : "—"}
          </span>{" "}
          {doc.days != null && (
            <>
              (<span className="font-semibold">{doc.days}</span> day{doc.days === 1 ? "" : "s"})
            </>
          )}
          .
        </p>
        {diagnosis && (
          <p>
            <span className="font-semibold">Diagnosis:</span> {diagnosis}
          </p>
        )}
        {doc.recommendation && (
          <p>
            <span className="font-semibold">Recommendation:</span> {doc.recommendation}
          </p>
        )}
      </section>

      <div className="flex items-end justify-between pt-10">
        <div className="text-center">
          <div className="flex size-24 items-center justify-center rounded-full border-2 border-dashed border-slate-300 text-[10px] uppercase tracking-wide text-slate-400">
            Official Stamp
          </div>
        </div>
        <SignatureLine
          name={doctorName}
          role={doc.issuedBy?.speciality ?? "Attending Physician"}
          label="Attending physician"
        />
      </div>

      {seal && (
        <div className="pt-2">
          <VerifySeal qrDataUrl={seal.qr} code={seal.code} url={seal.url} />
        </div>
      )}

      <DocFooter docNo={doc.docNo} issuedAt={doc.issuedAt} />
    </article>
  );
}
