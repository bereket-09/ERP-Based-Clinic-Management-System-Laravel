import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { FileText, Printer, ArrowLeft, User } from "lucide-react";
import { requireStaff } from "@/server/session";
import { getDocument } from "@/server/services/documents";
import { humanize } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { Separator } from "@/components/ui/separator";

interface DocPayload {
  orderId?: string;
  referralId?: string;
}

/** Resolve the print route for a document, when one applies. */
function printHref(type: string, docId: string, payload: DocPayload | null): string | null {
  switch (type) {
    case "SICK_LEAVE":
      return `/print/sick-leave/${docId}`;
    case "PRESCRIPTION":
      return payload?.orderId ? `/print/prescription/${payload.orderId}` : null;
    case "LAB_REPORT":
      return payload?.orderId ? `/print/lab/${payload.orderId}` : null;
    case "REFERRAL":
      return payload?.referralId ? `/print/referral/${payload.referralId}` : null;
    default:
      return null;
  }
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-sm text-foreground">{value || "—"}</div>
    </div>
  );
}

export default async function DocumentView({ params }: { params: Promise<{ id: string }> }) {
  await requireStaff();
  const { id } = await params;

  const doc = await getDocument(id);
  if (!doc) notFound();

  const payload = (doc.payload as DocPayload | null) ?? null;
  const href = printHref(doc.type, doc.id, payload);
  const issuer = doc.issuedBy
    ? `${doc.issuedBy.title ? doc.issuedBy.title + " " : ""}${doc.issuedBy.name}`
    : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Document ${doc.docNo}`}
        description={humanize(doc.type)}
        icon={FileText}
        actions={
          <>
            <Button asChild variant="ghost" size="sm">
              <Link href={doc.visitId ? `/visits/${doc.visitId}` : "/dashboard"}>
                <ArrowLeft /> Back
              </Link>
            </Button>
            {href && (
              <Button asChild variant="primary" size="sm">
                <Link href={href}>
                  <Printer /> Open printout
                </Link>
              </Button>
            )}
          </>
        }
      />

      <Card className="max-w-2xl">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="size-4 text-primary" />
            {humanize(doc.type)}
          </CardTitle>
          <StatusBadge state={doc.type} label={humanize(doc.type)} />
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Reference" value={<span className="font-mono">{doc.docNo}</span>} />
            <Field label="Issued" value={format(doc.issuedAt, "dd MMM yyyy, HH:mm")} />
            <Field label="Patient" value={doc.patient?.name} />
            <Field label="MRN" value={doc.patient?.mrn} />
            {doc.visit && <Field label="Visit" value={doc.visit.visitNo} />}
            <Field
              label="Issued by"
              value={
                issuer && (
                  <span className="inline-flex items-center gap-1.5">
                    <User className="size-3.5 text-muted-foreground" />
                    {issuer}
                  </span>
                )
              }
            />
          </div>

          {(doc.fromDate || doc.toDate || doc.days != null) && (
            <>
              <Separator />
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="From" value={doc.fromDate && format(doc.fromDate, "dd MMM yyyy")} />
                <Field label="To" value={doc.toDate && format(doc.toDate, "dd MMM yyyy")} />
                <Field label="Days" value={doc.days} />
              </div>
            </>
          )}

          {doc.recommendation && (
            <>
              <Separator />
              <Field label="Recommendation" value={doc.recommendation} />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
