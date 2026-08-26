import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, CalendarDays, Clock, Stethoscope, User } from "lucide-react";
import { requireRole } from "@/server/session";
import { db } from "@/server/db";
import { appointmentAffordances, appointmentVisitId } from "@/server/services/appointment";
import { humanize } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { AppointmentActions } from "./appointment-actions";

export const metadata = { title: "Appointment" };

function age(d?: Date | null) {
  if (!d) return null;
  return Math.floor((Date.now() - d.getTime()) / 3.15576e10);
}

export default async function AppointmentDetail({ params }: { params: Promise<{ id: string }> }) {
  const actor = await requireRole("RECEPTIONIST", "DOCTOR", "NURSE");
  const { id } = await params;

  const appt = await db.appointment.findUnique({
    where: { id },
    include: { patient: true, provider: true, createdBy: true },
  });
  if (!appt) notFound();

  const affordances = appointmentAffordances(appt.state, actor);
  const visitId = appt.state === "CHECKED_IN" || appt.state === "COMPLETED"
    ? await appointmentVisitId(appt.id)
    : null;
  const a = age(appt.patient.birthday);

  return (
    <div className="space-y-6">
      <Link
        href="/appointments"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Appointments
      </Link>

      {/* Patient banner */}
      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div>
            <div className="flex items-center gap-3">
              <Link
                href={`/patients/${appt.patientId}`}
                className="text-lg font-semibold hover:text-primary"
              >
                {appt.patient.name}
              </Link>
              <StatusBadge state={appt.state} />
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              {appt.patient.mrn}
              {appt.patient.studentId ? ` · ${appt.patient.studentId}` : ""} ·{" "}
              {[humanize(appt.patient.gender ?? ""), a ? `${a} yrs` : null, appt.patient.bloodType]
                .filter(Boolean)
                .join(" · ")}
            </div>
          </div>
          <div className="text-right text-sm">
            <div className="font-mono text-xs text-muted-foreground">{appt.apptNo}</div>
            <div className="text-muted-foreground">
              {appt.provider ? `Dr. ${appt.provider.name}` : "No provider assigned"}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Schedule info */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader className="flex-row items-center gap-2">
              <CalendarDays className="size-4 text-primary" />
              <CardTitle>Schedule</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Field
                icon={CalendarDays}
                label="Date"
                value={format(appt.scheduledFor, "EEEE, d MMMM yyyy")}
              />
              <Field
                icon={Clock}
                label="Time"
                value={`${format(appt.scheduledFor, "p")} · ${appt.durationMin} min`}
              />
              <Field
                icon={Stethoscope}
                label="Provider"
                value={appt.provider ? `Dr. ${appt.provider.name}` : "Any available"}
              />
              <Field
                icon={User}
                label="Booked by"
                value={appt.createdBy?.name ?? "—"}
              />
              <div className="sm:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Reason
                </p>
                <p className="mt-1 text-sm">{appt.reason || "—"}</p>
              </div>
              {appt.notes && (
                <div className="sm:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Notes
                  </p>
                  <p className="mt-1 text-sm">{appt.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {visitId && (
            <Card>
              <CardHeader>
                <CardTitle>Linked visit</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  A visit was opened when this patient checked in.
                </p>
                <Button asChild variant="outline">
                  <Link href={`/visits/${visitId}`}>Open visit</Link>
                </Button>
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
                Available to you as <Badge variant="outline">{humanize(actor.role ?? "")}</Badge> in
                this state.
              </p>
              <AppointmentActions appointmentId={appt.id} affordances={affordances} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Field({
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
        <p className="mt-0.5 text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
