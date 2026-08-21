import Link from "next/link";
import { notFound } from "next/navigation";
import { format, differenceInYears } from "date-fns";
import {
  Stethoscope,
  Activity,
  FileText,
  IdCard,
  Droplet,
  GraduationCap,
  ArrowRight,
  CalendarClock,
  ShieldCheck,
  HeartPulse,
  CalendarDays,
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

  const patient = await db.patient.findUnique({
    where: { id: actor.id },
    include: { allergies: true },
  });
  if (!patient) notFound();

  const now = new Date();

  const [totalVisits, activeVisit, recentVisit, activeSickLeave, upcomingAppointment] =
    await Promise.all([
      db.visit.count({ where: { patientId: patient.id } }),
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
      // A sick-leave note whose rest period still covers today.
      db.issuedDocument.findFirst({
        where: {
          patientId: patient.id,
          type: "SICK_LEAVE",
          toDate: { gte: now },
        },
        orderBy: { issuedAt: "desc" },
      }),
      db.appointment.findFirst({
        where: {
          patientId: patient.id,
          scheduledFor: { gte: now },
          state: { in: ["SCHEDULED", "CONFIRMED", "CHECKED_IN"] },
        },
        include: { provider: true },
        orderBy: { scheduledFor: "asc" },
      }),
    ]);

  const firstName = patient.name.split(" ")[0] || patient.name;
  const age = patient.birthday ? differenceInYears(now, patient.birthday) : null;
  const severeAllergies = patient.allergies.filter((a) => a.severity === "SEVERE");

  return (
    <div className="space-y-8">
      <PageHeader
        title={`${greeting()}, ${firstName}`}
        description="Your personal clinic record — visits, health, and documents, all in one place."
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
          <Field
            label="Year / Age"
            value={[patient.yearOfStudy, age != null ? `${age} yrs` : null]
              .filter(Boolean)
              .join(" · ")}
          />
        </CardContent>
      </Card>

      {/* Severe allergy safety banner */}
      {severeAllergies.length > 0 && (
        <div className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <ShieldCheck className="mt-0.5 size-5 shrink-0" />
          <div>
            <p className="font-medium">Severe allergy on file</p>
            <p className="mt-0.5 text-destructive/90">
              {severeAllergies.map((a) => a.substance).join(", ")}. Always mention this to any
              clinician who treats you.
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total visits"
          value={totalVisits}
          icon={Stethoscope}
          tone="brand"
          href="/portal/history"
        />
        <StatCard
          label="Active visit"
          value={activeVisit ? <StatusBadge state={activeVisit.state} /> : "None"}
          icon={Activity}
          tone={activeVisit ? "info" : "success"}
          href={activeVisit ? "/portal/history" : undefined}
        />
        <StatCard
          label="Active sick leave"
          value={activeSickLeave ? "Yes" : "None"}
          hint={
            activeSickLeave?.toDate
              ? `Until ${format(activeSickLeave.toDate, "PP")}`
              : undefined
          }
          icon={ShieldCheck}
          tone={activeSickLeave ? "warning" : "success"}
          href={activeSickLeave ? `/portal/documents/${activeSickLeave.id}` : "/portal/documents"}
        />
        <StatCard
          label="Next appointment"
          value={
            upcomingAppointment ? format(upcomingAppointment.scheduledFor, "MMM d") : "None"
          }
          hint={
            upcomingAppointment
              ? format(upcomingAppointment.scheduledFor, "p")
              : undefined
          }
          icon={CalendarClock}
          tone={upcomingAppointment ? "info" : "success"}
          href="/portal/appointments"
        />
      </div>

      {/* Upcoming appointment detail */}
      {upcomingAppointment && (
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="size-4 text-primary" /> Your next appointment
            </CardTitle>
            <StatusBadge state={upcomingAppointment.state} />
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
              <span className="font-medium text-foreground">
                {format(upcomingAppointment.scheduledFor, "EEEE, PPP")} at{" "}
                {format(upcomingAppointment.scheduledFor, "p")}
              </span>
              {upcomingAppointment.provider?.name && (
                <span className="text-muted-foreground">
                  with {upcomingAppointment.provider.name}
                </span>
              )}
              {upcomingAppointment.reason && (
                <span className="text-muted-foreground">· {upcomingAppointment.reason}</span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

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
            <Link
              href={`/portal/history/${recentVisit.id}`}
              className="block space-y-3 rounded-xl -m-2 p-2 transition-colors hover:bg-muted/50"
            >
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge state={recentVisit.state} />
                <span className="font-mono text-xs text-muted-foreground">
                  {recentVisit.visitNo}
                </span>
                <span className="text-sm text-muted-foreground">
                  {format(recentVisit.openedAt, "PPP")}
                </span>
              </div>
              <dl className="grid gap-3 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Attending doctor
                  </dt>
                  <dd className="mt-0.5 text-sm text-foreground">
                    {recentVisit.doctor?.name ?? "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Chief complaint
                  </dt>
                  <dd className="mt-0.5 text-sm text-foreground">
                    {recentVisit.chiefComplaint ?? "—"}
                  </dd>
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
            </Link>
          ) : (
            <p className="text-sm text-muted-foreground">
              You have no recorded visits yet. Visit the clinic to get started.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Quick links */}
      <div className="grid gap-4 sm:grid-cols-3">
        <QuickLink
          href="/portal/health"
          icon={HeartPulse}
          title="My health"
          desc="Vitals, trends & conditions"
        />
        <QuickLink
          href="/portal/documents"
          icon={FileText}
          title="My documents"
          desc="Sick notes & certificates"
        />
        <QuickLink
          href="/portal/appointments"
          icon={CalendarClock}
          title="Appointments"
          desc="Your scheduled visits"
        />
      </div>
    </div>
  );
}

function QuickLink({
  href,
  icon: Icon,
  title,
  desc,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}) {
  return (
    <Link href={href} className="group block">
      <Card className="flex h-full items-center gap-4 p-5 transition-shadow hover:shadow-md">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
          <Icon className="size-5" />
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-1 font-medium text-foreground">
            {title}
            <ArrowRight className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
          <div className="text-sm text-muted-foreground">{desc}</div>
        </div>
      </Card>
    </Link>
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
