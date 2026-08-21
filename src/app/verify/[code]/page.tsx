import Link from "next/link";
import { format } from "date-fns";
import { ShieldCheck, ShieldX, ShieldAlert, SearchX, ArrowLeft } from "lucide-react";
import { verifyByCode, formatVerifyCode } from "@/server/services/document-signing";
import { LogoMark } from "@/components/brand";
import { humanize } from "@/lib/utils";

export const metadata = { title: "Verify document" };
export const dynamic = "force-dynamic";

const STATUS = {
  valid: { icon: ShieldCheck, title: "Authentic document", tone: "text-success", ring: "ring-success/30", bg: "bg-success/10", blurb: "This document was issued by the clinic and has not been altered." },
  invalid: { icon: ShieldX, title: "Verification failed", tone: "text-destructive", ring: "ring-destructive/30", bg: "bg-destructive/10", blurb: "The details don't match our records — this document may have been altered. Do not accept it." },
  revoked: { icon: ShieldAlert, title: "Document revoked", tone: "text-warning", ring: "ring-warning/30", bg: "bg-warning/10", blurb: "This document was issued by the clinic but has since been revoked and is no longer valid." },
  not_found: { icon: SearchX, title: "Not found", tone: "text-muted-foreground", ring: "ring-border", bg: "bg-muted", blurb: "No document matches this code. Check the code from the printout and try again." },
} as const;

export default async function VerifyResultPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const result = await verifyByCode(code);
  const meta = STATUS[result.status];
  const Icon = meta.icon;
  const rec = "record" in result ? result.record : null;

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col px-4 py-10">
      <div className="mb-6 flex items-center gap-2.5">
        <LogoMark className="size-9" />
        <div>
          <div className="font-semibold leading-tight">DDU Clinic</div>
          <div className="text-xs text-muted-foreground">Document verification</div>
        </div>
      </div>

      <div className={`rounded-2xl border border-border bg-card p-6 shadow-sm ring-1 ${meta.ring}`}>
        <div className={`mb-4 flex items-center gap-3 rounded-xl ${meta.bg} px-4 py-3`}>
          <Icon className={`size-7 ${meta.tone}`} />
          <div>
            <div className={`font-semibold ${meta.tone}`}>{meta.title}</div>
            <div className="text-sm text-muted-foreground">{meta.blurb}</div>
          </div>
        </div>

        {rec && (
          <dl className="divide-y divide-border text-sm">
            <Row label="Document">{humanize(rec.type)}</Row>
            <Row label="Reference">{rec.docNo}</Row>
            {rec.patientName && <Row label="Patient">{rec.patientName}{rec.patientMrn ? ` · ${rec.patientMrn}` : ""}</Row>}
            {rec.fromDate && rec.toDate && (
              <Row label="Valid">
                {format(rec.fromDate, "PP")} – {format(rec.toDate, "PP")}{rec.days ? ` (${rec.days} day${rec.days === 1 ? "" : "s"})` : ""}
              </Row>
            )}
            {rec.issuedByName && <Row label="Issued by">{rec.issuedByName}</Row>}
            <Row label="Issued">{format(rec.issuedAt, "PPp")}</Row>
            <Row label="Code">{formatVerifyCode(rec.verifyCode)}</Row>
          </dl>
        )}

        {!rec && (
          <p className="text-center text-sm text-muted-foreground">
            Code entered: <span className="font-mono">{formatVerifyCode(code)}</span>
          </p>
        )}
      </div>

      <Link href="/verify" className="mt-6 inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
        <ArrowLeft className="size-4" /> Verify another document
      </Link>
      <p className="mt-4 text-xs text-muted-foreground">
        Verification recomputes a cryptographic signature over the document's official record. A genuine,
        unaltered document always verifies; a forged or edited one will not.
      </p>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-2.5">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{children}</dd>
    </div>
  );
}
