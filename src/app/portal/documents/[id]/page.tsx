import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { requireStudent } from "@/server/session";
import { db } from "@/server/db";
import { LogoMark } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { humanize } from "@/lib/utils";
import { PrintButton } from "./print-button";

export const metadata = { title: "Document" };

export default async function PortalDocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const actor = await requireStudent();

  const doc = await db.issuedDocument.findUnique({
    where: { id },
    include: { patient: true, issuedBy: true, visit: true },
  });

  // Only the owning student may view their own document.
  if (!doc || doc.patientId !== actor.id) notFound();

  const isSickLeave = doc.type === "SICK_LEAVE";

  return (
    <div className="space-y-5">
      {/* Chrome — hidden when printing */}
      <div className="no-print flex items-center justify-between">
        <Button asChild variant="ghost" size="sm">
          <Link href="/portal/documents">
            <ArrowLeft className="size-4" /> Back to documents
          </Link>
        </Button>
        <PrintButton />
      </div>

      {/* Printable document */}
      <article className="mx-auto max-w-2xl rounded-xl border border-border bg-card p-8 text-card-foreground card-shadow print:border-0 print:shadow-none">
        {/* Letterhead */}
        <header className="flex items-start justify-between gap-4 border-b border-border pb-5">
          <div className="flex items-center gap-3">
            <LogoMark className="size-11" />
            <div>
              <div className="text-lg font-semibold tracking-tight">DDU Clinic Center</div>
              <div className="text-sm text-muted-foreground">Student Health Services</div>
            </div>
          </div>
          <div className="text-right text-xs text-muted-foreground">
            <div className="font-mono text-sm text-foreground">{doc.docNo}</div>
            <div>Issued {format(doc.issuedAt, "PPP")}</div>
          </div>
        </header>

        <h1 className="mt-6 text-center text-xl font-semibold uppercase tracking-wide">
          {humanize(doc.type)}
        </h1>

        {/* Patient block */}
        <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <Row label="Patient" value={doc.patient?.name} />
          <Row label="Medical record no." value={doc.patient?.mrn} mono />
          <Row label="Student ID" value={doc.patient?.studentId} mono />
          <Row label="College" value={doc.patient?.college} />
          <Row label="Program" value={doc.patient?.program} />
          <Row label="Year of study" value={doc.patient?.yearOfStudy} />
        </dl>

        <Separator className="my-6" />

        {/* Type-specific body */}
        {isSickLeave ? (
          <div className="space-y-4 text-sm leading-relaxed">
            <p>
              This is to certify that the above-named student was examined at the DDU Clinic
              Center and is advised to rest from academic and related duties for the period
              stated below.
            </p>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3">
              <Row label="From" value={doc.fromDate ? format(doc.fromDate, "PPP") : null} />
              <Row label="To" value={doc.toDate ? format(doc.toDate, "PPP") : null} />
              <Row
                label="Total days"
                value={doc.days != null ? String(doc.days) : null}
              />
            </dl>
            {doc.recommendation && (
              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Recommendation
                </div>
                <p className="mt-1">{doc.recommendation}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4 text-sm leading-relaxed">
            {doc.recommendation && (
              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Notes
                </div>
                <p className="mt-1">{doc.recommendation}</p>
              </div>
            )}
            {doc.visit && (
              <Row label="Related visit" value={doc.visit.visitNo} mono />
            )}
            {!doc.recommendation && !doc.visit && (
              <p className="text-muted-foreground">
                This document has been issued to your records. Please present it as required.
              </p>
            )}
          </div>
        )}

        {/* Signature */}
        <footer className="mt-10 flex items-end justify-between">
          <div className="text-xs text-muted-foreground">
            <div>DDU Clinic Center · Student Health Services</div>
            <div>This document was generated from the student health portal.</div>
          </div>
          <div className="text-right">
            <div className="h-10" />
            <Separator className="w-40" />
            <div className="mt-1 text-sm font-medium">{doc.issuedBy?.name ?? "Attending clinician"}</div>
            <div className="text-xs text-muted-foreground">Authorized signature</div>
          </div>
        </footer>
      </article>
    </div>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value?: string | null;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className={mono ? "mt-0.5 font-mono text-foreground" : "mt-0.5 text-foreground"}>
        {value || "—"}
      </dd>
    </div>
  );
}
