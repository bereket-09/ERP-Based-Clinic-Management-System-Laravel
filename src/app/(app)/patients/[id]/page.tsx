import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, CalendarPlus, FileText, Stethoscope } from "lucide-react";
import { requireStaff } from "@/server/session";
import { getPatientDetail } from "@/server/services/patient";
import { humanize, initials } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { LabItemsList, DrugItemsList } from "@/components/clinical/order-details";

function age(d?: Date | null) {
  if (!d) return null;
  return Math.floor((Date.now() - d.getTime()) / 3.15576e10);
}

function Field({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium">{value ?? "—"}</dd>
    </div>
  );
}

export default async function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireStaff();
  const { id } = await params;
  const patient = await getPatientDetail(id);
  if (!patient) notFound();

  const a = age(patient.birthday);

  return (
    <div className="space-y-6">
      <Link href="/patients" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> All patients
      </Link>

      <PageHeader
        title={patient.name}
        description={`${patient.mrn}${patient.studentId ? ` · ${patient.studentId}` : ""}`}
        actions={
          <Button asChild variant="primary">
            <Link href={`/reception?patient=${patient.id}`}>
              <CalendarPlus className="size-4" /> New visit
            </Link>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Identity */}
        <Card className="lg:col-span-1">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <Avatar className="size-14">
                <AvatarFallback className="text-base">{initials(patient.name)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold">{patient.name}</div>
                <div className="text-sm text-muted-foreground">
                  {[humanize(patient.gender ?? ""), a ? `${a} yrs` : null].filter(Boolean).join(" · ")}
                </div>
              </div>
            </div>
            <dl className="mt-5 grid grid-cols-2 gap-4">
              <Field label="Blood type" value={patient.bloodType} />
              <Field label="Phone" value={patient.phone} />
              <Field label="College" value={patient.college} />
              <Field label="Program" value={patient.program} />
              <Field label="Year" value={patient.yearOfStudy} />
              <Field label="Dorm / Block" value={[patient.block, patient.dorm].filter(Boolean).join(" / ")} />
              <Field label="Emergency contact" value={patient.emergencyContactName} />
              <Field label="Emergency phone" value={patient.emergencyContactPhone} />
            </dl>
            <div className="mt-4 border-t border-border pt-3 text-xs text-muted-foreground">
              Source: {humanize(patient.source)} · Registered {format(patient.createdAt, "PP")}
            </div>
          </CardContent>
        </Card>

        {/* Visit history */}
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Visit history</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {patient.visits.length === 0 ? (
                <EmptyState title="No visits recorded" icon={Stethoscope} />
              ) : (
                patient.visits.map((v) => (
                  <details key={v.id} className="group rounded-xl border border-border p-4 open:bg-muted/30">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{format(v.openedAt, "PP")}</span>
                          <StatusBadge state={v.state} />
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {v.diagnosis || v.chiefComplaint || "—"} · {v.doctor?.name ?? "Unassigned"}
                        </div>
                      </div>
                      <span className="font-mono text-xs text-muted-foreground">{v.visitNo}</span>
                    </summary>
                    <div className="mt-4 grid gap-4 border-t border-border pt-4 sm:grid-cols-2">
                      <div>
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Lab tests</p>
                        <LabItemsList items={v.labOrders.flatMap((o) => o.items)} />
                      </div>
                      <div>
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Medications</p>
                        <DrugItemsList items={v.drugOrders.flatMap((o) => o.items)} />
                      </div>
                      {(v.symptoms || v.notes) && (
                        <div className="sm:col-span-2 text-sm text-muted-foreground">
                          {v.symptoms && <p><span className="font-medium text-foreground">Symptoms:</span> {v.symptoms}</p>}
                          {v.notes && <p><span className="font-medium text-foreground">Notes:</span> {v.notes}</p>}
                        </div>
                      )}
                    </div>
                  </details>
                ))
              )}
            </CardContent>
          </Card>

          {patient.issuedDocuments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Documents</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {patient.issuedDocuments.map((d) => (
                  <Link
                    key={d.id}
                    href={`/documents/${d.id}`}
                    className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm hover:border-primary hover:bg-accent"
                  >
                    <span className="flex items-center gap-2">
                      <FileText className="size-4 text-muted-foreground" />
                      {humanize(d.type)}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">{d.docNo}</span>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
