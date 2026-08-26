import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import {
  ArrowLeft,
  FlaskConical,
  Pill,
  HeartPulse,
  FileText,
  Stethoscope,
} from "lucide-react";
import { requireStudent } from "@/server/session";
import { db } from "@/server/db";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { humanize } from "@/lib/utils";

export const metadata = { title: "Visit detail" };

export default async function PortalVisitDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const actor = await requireStudent();

  const visit = await db.visit.findUnique({
    where: { id },
    include: {
      doctor: true,
      vitals: { orderBy: { createdAt: "desc" } },
      labOrders: { include: { items: { include: { test: true } } } },
      drugOrders: { include: { items: { include: { medication: true } } } },
      issuedDocuments: true,
    },
  });

  // Only the owning student may view their own visit.
  if (!visit || visit.patientId !== actor.id) notFound();

  const latestVitals = visit.vitals[0] ?? null;
  const labs = visit.labOrders.flatMap((o) =>
    o.items.map((it) => ({
      id: it.id,
      name: it.test.name,
      unit: it.test.unit,
      resultValue: it.resultValue,
      resultFlag: it.resultFlag,
      refLow: it.test.refRangeLow,
      refHigh: it.test.refRangeHigh,
    })),
  );
  const drugs = visit.drugOrders.flatMap((o) =>
    o.items.map((it) => ({
      id: it.id,
      name: it.medication.name,
      dose: it.dose,
      frequency: it.frequency,
      duration: it.duration,
    })),
  );

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2">
          <Link href="/portal/history">
            <ArrowLeft className="size-4" /> Back to visits
          </Link>
        </Button>
        <PageHeader
          icon={Stethoscope}
          title={`Visit ${visit.visitNo}`}
          description={format(visit.openedAt, "EEEE, PPP")}
          actions={<StatusBadge state={visit.state} />}
        />
      </div>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2">
            <Detail label="Attending doctor" value={visit.doctor?.name} />
            <Detail label="Chief complaint" value={visit.chiefComplaint} />
            <Detail label="Symptoms" value={visit.symptoms} />
            <Detail label="Diagnosis" value={visit.diagnosis ?? visit.disease} />
          </dl>
        </CardContent>
      </Card>

      {/* Vitals recorded this visit */}
      {latestVitals && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HeartPulse className="size-4 text-primary" /> Vitals recorded
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              <Vital
                label="Blood pressure"
                value={
                  latestVitals.systolic && latestVitals.diastolic
                    ? `${latestVitals.systolic}/${latestVitals.diastolic}`
                    : null
                }
                unit="mmHg"
              />
              <Vital label="Pulse" value={latestVitals.pulseBpm} unit="bpm" />
              <Vital label="Temperature" value={latestVitals.temperatureC} unit="°C" />
              <Vital label="SpO₂" value={latestVitals.spo2} unit="%" />
              <Vital label="Resp. rate" value={latestVitals.respRate} unit="/min" />
              <Vital label="Weight" value={latestVitals.weightKg} unit="kg" />
              <Vital label="Height" value={latestVitals.heightCm} unit="cm" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lab tests */}
      {labs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FlaskConical className="size-4 text-primary" /> Lab tests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-border">
              {labs.map((l) => (
                <li key={l.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <div>
                    <span className="text-foreground">{l.name}</span>
                    {(l.refLow != null || l.refHigh != null) && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        ref {l.refLow ?? "–"}–{l.refHigh ?? "–"}
                        {l.unit ? ` ${l.unit}` : ""}
                      </span>
                    )}
                  </div>
                  <span className="flex items-center gap-2">
                    <span className="font-mono text-muted-foreground">
                      {l.resultValue ?? "pending"}
                      {l.resultValue && l.unit ? ` ${l.unit}` : ""}
                    </span>
                    {l.resultFlag && <StatusBadge state={l.resultFlag} />}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Medications */}
      {drugs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pill className="size-4 text-primary" /> Medications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2.5">
              {drugs.map((d) => (
                <li key={d.id} className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                  <span className="font-medium text-foreground">{d.name}</span>
                  {d.dose && <Badge variant="outline">{d.dose}</Badge>}
                  {d.frequency && <Badge variant="outline">{d.frequency}</Badge>}
                  {d.duration && <span className="text-muted-foreground">for {d.duration}</span>}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Documents from this visit */}
      {visit.issuedDocuments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="size-4 text-primary" /> Documents from this visit
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {visit.issuedDocuments.map((doc) => (
              <Link
                key={doc.id}
                href={`/portal/documents/${doc.id}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-border px-4 py-3 text-sm transition-colors hover:bg-muted/50"
              >
                <span className="flex items-center gap-2 font-medium text-foreground">
                  <FileText className="size-4 text-muted-foreground" />
                  {humanize(doc.type)}
                </span>
                <Badge variant="outline" className="font-mono">
                  {doc.docNo}
                </Badge>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}

      <Separator />
      <p className="text-xs text-muted-foreground">
        This is a read-only summary of your clinic encounter. If anything looks incorrect, please
        raise it with the clinic reception on your next visit.
      </p>
    </div>
  );
}

function Detail({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm text-foreground">{value || "—"}</dd>
    </div>
  );
}

function Vital({
  label,
  value,
  unit,
}: {
  label: string;
  value?: number | string | null;
  unit?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card/50 p-3">
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-lg font-semibold tracking-tight text-foreground">
        {value != null && value !== "" ? (
          <>
            {value}
            {unit && <span className="ml-1 text-xs font-normal text-muted-foreground">{unit}</span>}
          </>
        ) : (
          "—"
        )}
      </div>
    </div>
  );
}
