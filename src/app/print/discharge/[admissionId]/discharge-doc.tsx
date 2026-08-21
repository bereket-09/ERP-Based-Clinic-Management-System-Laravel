"use client";
import { useState } from "react";
import { format } from "date-fns";
import { Printer } from "lucide-react";
import type { Branding } from "@/server/services/settings";
import { Letterhead, Field, SignatureLine, DocFooter, VerifySeal } from "@/components/print/letterhead";
import { Button } from "@/components/ui/button";

interface Med { name: string; dose: string | null; frequency: string | null; duration: string | null }

export function DischargeDoc({
  branding,
  docNo,
  issuedAt,
  seal,
  patient,
  admission,
  meds,
  doctorName,
  doctorRole,
}: {
  branding: Branding;
  docNo: string;
  issuedAt: string;
  seal: { qr: string; code: string; url: string } | null;
  patient: { name: string; mrn: string; studentId: string | null; ageSex: string | null };
  admission: {
    admNo: string; ward: string | null; bed: string | null; admittedAt: string; dischargedAt: string;
    los: number; reason: string | null; dischargeNotes: string | null; diagnosis: string | null;
  };
  meds: Med[];
  doctorName: string | null;
  doctorRole: string;
}) {
  const [show, setShow] = useState({
    diagnosis: !!admission.diagnosis,
    course: !!admission.dischargeNotes,
    reason: !!admission.reason,
    meds: meds.length > 0,
  });
  const toggle = (k: keyof typeof show) => setShow((s) => ({ ...s, [k]: !s[k] }));

  const options: { key: keyof typeof show; label: string; disabled: boolean }[] = [
    { key: "reason", label: "Reason for admission", disabled: !admission.reason },
    { key: "diagnosis", label: "Diagnosis", disabled: !admission.diagnosis },
    { key: "course", label: "Hospital course & instructions", disabled: !admission.dischargeNotes },
    { key: "meds", label: "Discharge medications", disabled: meds.length === 0 },
  ];

  return (
    <>
      {/* Print controls — hidden on paper */}
      <div className="mb-5 flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card p-4 print:hidden">
        <span className="text-sm font-medium">Include sections:</span>
        {options.map((o) => (
          <label key={o.key} className={`flex items-center gap-1.5 text-sm ${o.disabled ? "opacity-40" : ""}`}>
            <input type="checkbox" checked={show[o.key]} disabled={o.disabled} onChange={() => toggle(o.key)} className="accent-primary" />
            {o.label}
          </label>
        ))}
        <Button variant="primary" size="sm" className="ml-auto" onClick={() => window.print()}>
          <Printer className="size-4" /> Print
        </Button>
      </div>

      <article className="space-y-5">
        <Letterhead branding={branding} contact="Ward Discharge Summary" />

        <div className="text-center">
          <h1 className="font-serif text-xl font-bold uppercase tracking-wide text-slate-900">Discharge Summary</h1>
          <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Inpatient / ward</p>
        </div>

        <section className="grid grid-cols-2 gap-4 rounded-md border border-slate-200 bg-slate-50 p-4 sm:grid-cols-4">
          <Field label="Patient" value={patient.name} />
          <Field label="MRN" value={patient.mrn} />
          <Field label="Age / Sex" value={patient.ageSex} />
          <Field label="Admission No." value={admission.admNo} />
          <Field label="Ward / Bed" value={[admission.ward, admission.bed].filter(Boolean).join(" · ") || null} />
          <Field label="Admitted" value={format(new Date(admission.admittedAt), "dd MMM yyyy")} />
          <Field label="Discharged" value={format(new Date(admission.dischargedAt), "dd MMM yyyy")} />
          <Field label="Length of stay" value={`${admission.los} day${admission.los === 1 ? "" : "s"}`} />
        </section>

        {show.reason && admission.reason && (
          <Block title="Reason for admission"><p>{admission.reason}</p></Block>
        )}
        {show.diagnosis && admission.diagnosis && (
          <Block title="Diagnosis"><p className="font-medium">{admission.diagnosis}</p></Block>
        )}
        {show.course && admission.dischargeNotes && (
          <Block title="Hospital course & discharge instructions">
            <p className="whitespace-pre-line">{admission.dischargeNotes}</p>
          </Block>
        )}
        {show.meds && meds.length > 0 && (
          <Block title="Discharge medications">
            <ul className="list-disc space-y-0.5 pl-5">
              {meds.map((m, i) => (
                <li key={i}>{[m.name, m.dose, m.frequency, m.duration].filter(Boolean).join(" · ")}</li>
              ))}
            </ul>
          </Block>
        )}

        <div className="flex items-end justify-between pt-6">
          {seal ? <VerifySeal qrDataUrl={seal.qr} code={seal.code} url={seal.url} /> : <div />}
          <SignatureLine name={doctorName} role={doctorRole} label="Attending physician" />
        </div>

        <DocFooter docNo={docNo} issuedAt={new Date(issuedAt)} />
      </article>
    </>
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
