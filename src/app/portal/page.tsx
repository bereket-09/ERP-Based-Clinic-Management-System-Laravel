import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import {
  Stethoscope,
  Activity,
  FileText,
  IdCard,
  Droplet,
  GraduationCap,
  ArrowRight,
} from "lucide-react";
import { requireStudent } from "@/server/session";
import { db } from "@/server/db";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Overview" };

const ACTIVE_STATES = [
  "REGISTERED",
  "TRIAGE",
  "WAITING_FOR_DOCTOR",
  "IN_CONSULTATION",
  "WAITING_FOR_LAB",
  "LAB_RESULTS_READY",
  "WAITING_FOR_PHARMACY",
  "REFERRED",
  "ADMITTED",
] as const;

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default async function PortalOverviewPage() {
  const actor = await requireStudent();

  const patient = await db.patient.findUnique({ where: { id: actor.id } });
  if (!patient) notFound();

  const [totalVisits, documentsCount, activeVisit, recentVisit] = await Promise.all([
    db.visit.count({ where: { patientId: patient.id } }),
    db.issuedDocument.count({ where: { patientId: patient.id } }),
    db.visit.findFirst({
      where: { patientId: patient.id, state: { in: [...ACTIVE_STATES] } },
      include: { doctor: true },
      orderBy: { openedAt: "desc" },
    }),
    db.visit.findFirst({
      where: { patientId: patient.id },
      include: { doctor: true },
      orderBy: { openedAt: "desc" },
    }),
  ]);

  const firstName = patient.name.split(" ")[0] || patient.name;

  return (
    <div className="space-y-8">
      <PageHeader
        title={`${greeting()}, ${firstName}`}
        description="Your personal clinic record — visits, documents, and requests, all in one place."
      />

      {/* Identity card */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>My identity card</CardTitle>
          <StatusBadge state={patient.portalEnabled ? "ACTIVE" : "SUSPENDED"} label="Portal" />
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
          <Field icon={IdCard} label="Medical record no." value={patient.mrn} mono />
          <Field icon={GraduationCap} label="Student ID" value={patient.studentId} mono />
          <Field icon={Droplet} label="Blood type" value={patient.bloodType} />
          <Field label="College" value={patient.college} />
          <Field label="Program" value={patient.program} />
          <Field label="Year of study" value={patient.yearOfStudy} />
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total visits" value={totalVisits} icon={Stethoscope} tone="brand" href="/portal/history" />
        <StatCard
          label="Active visit"
          value={activeVisit ? <StatusBadge state={activeVisit.state} /> : "None"}
          icon={Activity}
          tone={activeVisit ? "info" : "success"}
          href={activeVisit ? "/portal/history" : undefined}
        />
        <StatCard label="Documents" value={documentsCount} icon={FileText} tone="brand" href="/portal/documents" />
      </div>

      {/* Most recent visit */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Most recent visit</CardTitle>
          <Button asChild variant="ghost" size="sm">
            <Link href="/portal/history">
              View all <ArrowRight className="size-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentVisit ? (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge state={recentVisit.state} />
                <span className="font-mono text-xs text-muted-foreground">{recentVisit.visitNo}</span>
                <span className="text-sm text-muted-foreground">
                  {format(recentVisit.openedAt, "PPP")}
                </span>
              </div>
              <dl className="grid gap-3 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Attending doctor
                  </dt>
                  <dd className="mt-0.5 text-sm text-foreground">{recentVisit.doctor?.name ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Chief complaint
                  </dt>
                  <dd className="mt-0.5 text-sm text-foreground">{recentVisit.chiefComplaint ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Diagnosis
                  </dt>
                  <dd className="mt-0.5 text-sm text-foreground">
                    {recentVisit.diagnosis ?? recentVisit.disease ?? "—"}
                  </dd>
                </div>
              </dl>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              You have no recorded visits yet. Visit the clinic to get started.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  value?: string | null;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {Icon && <Icon className="size-3.5" />}
        {label}
      </dt>
      <dd className={mono ? "mt-1 font-mono text-sm text-foreground" : "mt-1 text-sm text-foreground"}>
        {value || "—"}
      </dd>
    </div>
  );
}
