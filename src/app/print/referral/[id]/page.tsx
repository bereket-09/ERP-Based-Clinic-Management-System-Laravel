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

export default async function ReferralPrint({ params }: { params: Promise<{ id: string }> }) {
  await requireStaff();
  const { id } = await params;

  const [referral, branding] = await Promise.all([
    db.referral.findUnique({
      where: { id },
      include: {
        patient: true,
        referredBy: { select: { name: true, title: true, speciality: true } },
      },
    }),
    getBranding(),
  ]);
  if (!referral) notFound();

  const p = referral.patient;
  const doctorName = referral.referredBy
    ? `${referral.referredBy.title ? referral.referredBy.title + " " : ""}${referral.referredBy.name}`
    : null;
  const issuedAt = referral.issuedAt ?? referral.createdAt;

  return (
    <article className="space-y-6">
      <Letterhead branding={branding} contact="Patient Referral Letter" />

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-lg font-bold text-slate-900">Referral Letter</h1>
          <p className="text-[11px] text-slate-500">No. {referral.referralNo}</p>
        </div>
        <div className="text-right text-[11px] text-slate-600">
          <div className="font-semibold uppercase tracking-wide text-slate-500">Urgency</div>
          <div className="text-[13px] font-semibold text-slate-900">{humanize(referral.urgency)}</div>
        </div>
      </div>

      <section className="text-[13px] text-slate-800">
        <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">To</div>
        <div className="text-[15px] font-semibold text-slate-900">{referral.toFacility}</div>
        {referral.toDepartment && (
          <div className="text-slate-600">Attn: {referral.toDepartment} Department</div>
        )}
      </section>

      <section className="grid grid-cols-2 gap-4 rounded-md border border-slate-200 bg-slate-50 p-4 sm:grid-cols-4">
        <Field label="Patient" value={p.name} />
        <Field label="MRN" value={p.mrn} />
        <Field label="Age / Sex" value={[age(p.birthday), p.gender].filter(Boolean).join(" / ") || null} />
        <Field label="Phone" value={p.phone} />
      </section>

      <section className="space-y-4">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Reason for referral
          </div>
          <p className="whitespace-pre-line text-[13px] text-slate-800">{referral.reason}</p>
        </div>
        {referral.clinicalSummary && (
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Clinical summary
            </div>
            <p className="whitespace-pre-line text-[13px] text-slate-800">{referral.clinicalSummary}</p>
          </div>
        )}
        {referral.investigations && (
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Investigations
            </div>
            <p className="whitespace-pre-line text-[13px] text-slate-800">{referral.investigations}</p>
          </div>
        )}
        {referral.treatmentGiven && (
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Treatment given
            </div>
            <p className="whitespace-pre-line text-[13px] text-slate-800">{referral.treatmentGiven}</p>
          </div>
        )}
      </section>

      <section className="text-[12px] text-slate-700">
        <p>
          Thank you for kindly attending to this patient. Please do not hesitate to contact us for any
          further clinical information.
        </p>
      </section>

      <div className="flex items-end justify-between pt-8">
        <div className="text-[11px] text-slate-500">
          Date: {format(issuedAt, "dd MMM yyyy")}
        </div>
        <SignatureLine
          name={doctorName}
          role={referral.referredBy?.speciality ?? "Referring Physician"}
          label="Referring doctor"
        />
      </div>

      <DocFooter docNo={referral.referralNo} issuedAt={issuedAt} />
    </article>
  );
}
