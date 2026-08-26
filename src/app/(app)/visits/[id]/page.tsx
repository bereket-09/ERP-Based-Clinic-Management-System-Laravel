import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, Activity, HeartPulse, Stethoscope, FileText, FileCheck2, Printer } from "lucide-react";
import { requireStaff } from "@/server/session";
import { db } from "@/server/db";
import { visitAffordances } from "@/server/services/visit";
import { humanize } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { LabItemsList, DrugItemsList } from "@/components/clinical/order-details";
import { EmptyState } from "@/components/empty-state";
import { VisitActions } from "./visit-actions";
import { ConsultEditor } from "./consult-editor";

function age(d?: Date | null) {
  if (!d) return null;
  return Math.floor((Date.now() - d.getTime()) / 3.15576e10);
}

export default async function VisitWorkspace({ params }: { params: Promise<{ id: string }> }) {
  const actor = await requireStaff();
  const { id } = await params;

  const visit = await db.visit.findUnique({
    where: { id },
    include: {
      patient: true,
      doctor: true,
      vitals: { orderBy: { createdAt: "desc" } },
      labOrders: { include: { items: { include: { test: true } } }, orderBy: { createdAt: "desc" } },
      drugOrders: { include: { items: { include: { medication: true } } }, orderBy: { createdAt: "desc" } },
      clinicalNotes: { orderBy: { createdAt: "desc" }, include: { author: true } },
    },
  });
  if (!visit) notFound();

  const [catalog, history] = await Promise.all([
    Promise.all([
      db.labTest.findMany({ where: { isActive: true }, orderBy: { name: "asc" }, select: { id: true, name: true, category: true, price: true } }),
      db.medication.findMany({ where: { isActive: true }, orderBy: { name: "asc" }, select: { id: true, name: true, strength: true, form: true } }),
      db.ward.findMany({ where: { isActive: true }, include: { beds: true } }),
      db.user.findMany({ where: { role: "DOCTOR", isActive: true }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    ]),
    db.visit.findMany({
      where: { patientId: visit.patientId, id: { not: visit.id } },
      orderBy: { openedAt: "desc" },
      take: 5,
      include: {
        doctor: true,
        labOrders: { include: { items: { include: { test: true } } } },
        drugOrders: { include: { items: { include: { medication: true } } } },
      },
    }),
  ]);

  const [labTests, medications, wards, doctors] = catalog;
  const issuedDocs = await db.issuedDocument.findMany({
    where: { visitId: visit.id },
    orderBy: { issuedAt: "desc" },
  });
  const affordances = visitAffordances(visit.state, actor);

  // Which print route serves each document type.
  const printPath: Partial<Record<string, string>> = {
    SICK_LEAVE: `/print/sick-leave`,
    PRESCRIPTION: `/print/prescription`,
    LAB_REPORT: `/print/lab`,
    REFERRAL: `/print/referral`,
    RECEIPT: `/print/receipt`,
  };
  const latest = visit.vitals[0];
  const a = age(visit.patient.birthday);

  return (
    <div className="space-y-6">
      <Link href="/doctor" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Consultation queue
      </Link>

      {/* Patient banner */}
      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div>
            <div className="flex items-center gap-3">
              <Link href={`/patients/${visit.patientId}`} className="text-lg font-semibold hover:text-primary">
                {visit.patient.name}
              </Link>
              <StatusBadge state={visit.state} />
              {visit.priority !== "ROUTINE" && <StatusBadge state={visit.priority} />}
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              {visit.patient.mrn}
              {visit.patient.studentId ? ` · ${visit.patient.studentId}` : ""} ·{" "}
              {[humanize(visit.patient.gender ?? ""), a ? `${a} yrs` : null, visit.patient.bloodType].filter(Boolean).join(" · ")}
            </div>
          </div>
          <div className="text-right text-sm">
            <div className="font-mono text-xs text-muted-foreground">{visit.visitNo}</div>
            <div className="text-muted-foreground">{visit.doctor?.name ?? "Unassigned"}</div>
            <div className="text-xs text-muted-foreground">Opened {format(visit.openedAt, "PP p")}</div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main */}
        <div className="space-y-6 lg:col-span-2">
          {/* Vitals */}
          <Card>
            <CardHeader className="flex-row items-center gap-2">
              <HeartPulse className="size-4 text-primary" />
              <CardTitle>Vitals</CardTitle>
            </CardHeader>
            <CardContent>
              {latest ? (
                <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
                  <Vital label="Temp" value={latest.temperatureC != null ? `${latest.temperatureC}°C` : "—"} />
                  <Vital label="Pulse" value={latest.pulseBpm != null ? `${latest.pulseBpm}` : "—"} />
                  <Vital label="BP" value={latest.systolic != null ? `${latest.systolic}/${latest.diastolic ?? "—"}` : "—"} />
                  <Vital label="SpO₂" value={latest.spo2 != null ? `${latest.spo2}%` : "—"} />
                  <Vital label="Weight" value={latest.weightKg != null ? `${latest.weightKg}kg` : "—"} />
                  <Vital label="Resp" value={latest.respRate != null ? `${latest.respRate}` : "—"} />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No vitals recorded yet.</p>
              )}
            </CardContent>
          </Card>

          {/* Consultation editor (doctors, while in consultation) */}
          {actor.role === "DOCTOR" && ["IN_CONSULTATION", "LAB_RESULTS_READY"].includes(visit.state) && (
            <Card>
              <CardHeader className="flex-row items-center gap-2">
                <Stethoscope className="size-4 text-primary" />
                <CardTitle>Consultation</CardTitle>
              </CardHeader>
              <CardContent>
                <ConsultEditor
                  visitId={visit.id}
                  initial={{
                    chiefComplaint: visit.chiefComplaint ?? undefined,
                    symptoms: visit.symptoms ?? undefined,
                    diagnosis: visit.diagnosis ?? undefined,
                    disease: visit.disease ?? undefined,
                    icdCode: visit.icdCode ?? undefined,
                    notes: visit.notes ?? undefined,
                  }}
                />
              </CardContent>
            </Card>
          )}

          {/* Current orders */}
          <Card>
            <CardHeader>
              <CardTitle>Orders this visit</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-5 sm:grid-cols-2">
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Laboratory</p>
                {visit.labOrders.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No lab orders.</p>
                ) : (
                  visit.labOrders.map((o) => (
                    <div key={o.id} className="mb-2">
                      <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-mono">{o.orderNo}</span>
                        <StatusBadge state={o.state} />
                      </div>
                      <LabItemsList items={o.items} />
                    </div>
                  ))
                )}
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Medications</p>
                {visit.drugOrders.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No prescriptions.</p>
                ) : (
                  visit.drugOrders.map((o) => (
                    <div key={o.id} className="mb-2">
                      <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-mono">{o.orderNo}</span>
                        <StatusBadge state={o.state} />
                      </div>
                      <DrugItemsList items={o.items} />
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* History */}
          <Card>
            <CardHeader>
              <CardTitle>Previous visits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {history.length === 0 ? (
                <EmptyState title="No prior visits" icon={Activity} />
              ) : (
                history.map((h) => (
                  <details key={h.id} className="rounded-lg border border-border p-3">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-2">
                      <span className="text-sm">
                        <span className="font-medium">{format(h.openedAt, "PP")}</span> · {h.diagnosis || h.chiefComplaint || "—"}
                      </span>
                      <StatusBadge state={h.state} />
                    </summary>
                    <div className="mt-3 grid gap-3 border-t border-border pt-3 sm:grid-cols-2">
                      <LabItemsList items={h.labOrders.flatMap((o) => o.items)} />
                      <DrugItemsList items={h.drugOrders.flatMap((o) => o.items)} />
                    </div>
                  </details>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Action rail */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-3 text-xs text-muted-foreground">
                Available to you as <Badge variant="outline">{humanize(actor.role ?? "")}</Badge> in this state.
              </p>
              <VisitActions
                visitId={visit.id}
                affordances={affordances}
                catalog={{ labTests, medications, wards, doctors }}
              />
            </CardContent>
          </Card>

          {/* Documents — issue & reprint verifiable certificates */}
          <Card>
            <CardHeader className="flex-row items-center gap-2">
              <FileText className="size-4 text-primary" />
              <CardTitle>Documents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild variant="outline" className="w-full justify-start">
                <a href={`/print/visit-summary/${visit.id}`} target="_blank" rel="noopener noreferrer">
                  <Printer className="size-4" /> Print visit summary
                </a>
              </Button>
              {actor.role === "DOCTOR" && (
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href={`/documents/issue/${visit.id}`}>
                    <FileCheck2 className="size-4" /> Issue sick leave / rest certificate
                  </Link>
                </Button>
              )}

              {issuedDocs.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No documents issued for this visit yet.
                </p>
              ) : (
                <ul className="space-y-2">
                  {issuedDocs.map((d) => (
                    <li key={d.id} className="flex items-center justify-between gap-2 rounded-lg border border-border p-2.5">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">{humanize(d.type)}</div>
                        <div className="font-mono text-[11px] text-muted-foreground">{d.docNo}</div>
                      </div>
                      {printPath[d.type] && (
                        <Button asChild variant="ghost" size="sm">
                          <a href={`${printPath[d.type]}/${d.id}`} target="_blank" rel="noopener noreferrer">
                            <Printer className="size-4" /> Print
                          </a>
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}

function Vital({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-0.5 font-semibold">{value}</div>
    </div>
  );
}
