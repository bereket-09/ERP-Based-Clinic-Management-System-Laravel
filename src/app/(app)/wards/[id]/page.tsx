import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import {
  ArrowLeft,
  BedDouble,
  Building2,
  CalendarClock,
  ClipboardList,
  Stethoscope,
  UserRound,
} from "lucide-react";
import { requireRole } from "@/server/session";
import { db } from "@/server/db";
import { admissionAffordances } from "@/server/services/ward";
import { humanize } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/status-badge";
import { AdmissionActions, type BedOption } from "./admission-actions";

export const metadata = { title: "Admission" };

function age(d?: Date | null) {
  if (!d) return null;
  return Math.floor((Date.now() - d.getTime()) / 3.15576e10);
}

export default async function AdmissionDetail({ params }: { params: Promise<{ id: string }> }) {
  const actor = await requireRole("NURSE", "DOCTOR");
  const { id } = await params;

  const admission = await db.admission.findUnique({
    where: { id },
    include: {
      patient: true,
      ward: true,
      bed: true,
      admittedBy: { select: { name: true } },
      visit: { select: { id: true, visitNo: true, state: true, diagnosis: true } },
    },
  });
  if (!admission) notFound();

  const availableBedRows = await db.bed.findMany({
    where: { status: "AVAILABLE", ward: { isActive: true } },
    include: { ward: { select: { name: true } } },
    orderBy: [{ ward: { name: "asc" } }, { label: "asc" }],
  });
  const availableBeds: BedOption[] = availableBedRows.map((b) => ({
    id: b.id,
    label: b.label,
    wardName: b.ward.name,
  }));

  const affordances = admissionAffordances(admission.state, actor);
  const a = age(admission.patient.birthday);
  const isActive = admission.state === "ADMITTED" || admission.state === "ON_WARD";

  return (
    <div className="space-y-6">
      <Link href="/wards" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Bed board
      </Link>

      {/* Patient banner */}
      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div>
            <div className="flex items-center gap-3">
              <Link href={`/patients/${admission.patientId}`} className="text-lg font-semibold hover:text-primary">
                {admission.patient.name}
              </Link>
              <StatusBadge state={admission.state} />
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              {admission.patient.mrn}
              {admission.patient.studentId ? ` · ${admission.patient.studentId}` : ""} ·{" "}
              {[humanize(admission.patient.gender ?? ""), a ? `${a} yrs` : null, admission.patient.bloodType]
                .filter(Boolean)
                .join(" · ")}
            </div>
          </div>
          <div className="text-right text-sm">
            <div className="font-mono text-xs text-muted-foreground">{admission.admNo}</div>
            <div className="text-muted-foreground">
              {admission.ward?.name ?? "No ward"}
              {admission.bed ? ` · Bed ${admission.bed.label}` : ""}
            </div>
            <div className="text-xs text-muted-foreground">Admitted {format(admission.admittedAt, "PP p")}</div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader className="flex-row items-center gap-2">
              <ClipboardList className="size-4 text-primary" />
              <CardTitle>Admission details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-5 sm:grid-cols-2">
              <Detail icon={Building2} label="Ward" value={admission.ward?.name ?? "—"} />
              <Detail icon={BedDouble} label="Bed" value={admission.bed?.label ?? "Unassigned"} />
              <Detail icon={UserRound} label="Admitted by" value={admission.admittedBy?.name ?? "—"} />
              <Detail
                icon={CalendarClock}
                label="Admitted at"
                value={format(admission.admittedAt, "PP p")}
              />
              {admission.dischargedAt && (
                <Detail
                  icon={CalendarClock}
                  label="Discharged at"
                  value={format(admission.dischargedAt, "PP p")}
                />
              )}
              {admission.ward?.gender && (
                <Detail icon={UserRound} label="Ward type" value={`${humanize(admission.ward.gender)} ward`} />
              )}
              <div className="sm:col-span-2">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Reason for admission
                </p>
                <p className="text-sm">{admission.reason || "—"}</p>
              </div>
              {admission.dischargeNotes && (
                <div className="sm:col-span-2">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Discharge notes
                  </p>
                  <p className="text-sm">{admission.dischargeNotes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {admission.visit && (
            <Card>
              <CardHeader className="flex-row items-center gap-2">
                <Stethoscope className="size-4 text-primary" />
                <CardTitle>Originating visit</CardTitle>
              </CardHeader>
              <CardContent>
                <Link
                  href={`/visits/${admission.visit.id}`}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border p-3 hover:bg-muted/50"
                >
                  <div>
                    <div className="font-mono text-xs text-muted-foreground">{admission.visit.visitNo}</div>
                    <div className="text-sm">{admission.visit.diagnosis || "No diagnosis recorded"}</div>
                  </div>
                  <StatusBadge state={admission.visit.state} />
                </Link>
              </CardContent>
            </Card>
          )}
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
              {isActive ? (
                <AdmissionActions
                  admissionId={admission.id}
                  affordances={affordances}
                  availableBeds={availableBeds}
                  currentBedId={admission.bedId}
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  This admission is {humanize(admission.state).toLowerCase()} — no further actions.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Detail({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 size-4 text-muted-foreground" />
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="text-sm">{value}</p>
      </div>
    </div>
  );
}
