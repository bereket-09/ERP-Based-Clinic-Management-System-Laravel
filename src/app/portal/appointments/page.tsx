import { format } from "date-fns";
import { CalendarClock, CalendarDays, Clock, User, Info } from "lucide-react";
import { requireStudent } from "@/server/session";
import { db } from "@/server/db";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = { title: "Appointments" };

export default async function PortalAppointmentsPage() {
  const actor = await requireStudent();

  const appointments = await db.appointment.findMany({
    where: { patientId: actor.id },
    include: { provider: true },
    orderBy: { scheduledFor: "desc" },
  });

  const now = new Date();
  const upcoming = appointments
    .filter((a) => a.scheduledFor >= now && !["CANCELLED", "COMPLETED", "NO_SHOW"].includes(a.state))
    .sort((a, b) => a.scheduledFor.getTime() - b.scheduledFor.getTime());
  const past = appointments.filter((a) => !upcoming.includes(a));

  return (
    <div className="space-y-6">
      <PageHeader
        icon={CalendarClock}
        title="My appointments"
        description="Your scheduled clinic appointments. This is a read-only view of what the clinic has booked for you."
      />

      <div className="flex items-start gap-2 rounded-2xl border border-info/30 bg-info/10 px-4 py-3 text-sm text-info">
        <Info className="mt-0.5 size-4 shrink-0" />
        <span>
          To book, reschedule, or cancel an appointment, please contact the clinic reception. Any
          changes they make will appear here automatically.
        </span>
      </div>

      {appointments.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="No appointments scheduled"
          description="When the clinic books an appointment for you, it will show up here."
        />
      ) : (
        <div className="space-y-8">
          {upcoming.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Upcoming
              </h2>
              {upcoming.map((a) => (
                <AppointmentRow key={a.id} appt={a} highlight />
              ))}
            </section>
          )}

          {past.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Past & closed
              </h2>
              {past.map((a) => (
                <AppointmentRow key={a.id} appt={a} />
              ))}
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function AppointmentRow({
  appt,
  highlight,
}: {
  appt: {
    id: string;
    apptNo: string;
    state: string;
    scheduledFor: Date;
    durationMin: number;
    reason: string | null;
    provider: { name: string } | null;
  };
  highlight?: boolean;
}) {
  return (
    <Card className={highlight ? "border-primary/30" : undefined}>
      <CardContent className="flex flex-wrap items-center gap-4 p-5">
        <span
          className={
            "flex size-12 shrink-0 flex-col items-center justify-center rounded-xl text-center " +
            (highlight ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground")
          }
        >
          <span className="text-[10px] font-medium uppercase leading-none">
            {format(appt.scheduledFor, "MMM")}
          </span>
          <span className="text-lg font-semibold leading-tight">
            {format(appt.scheduledFor, "d")}
          </span>
        </span>

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            <span className="flex items-center gap-1.5 font-medium text-foreground">
              <CalendarDays className="size-3.5 text-muted-foreground" />
              {format(appt.scheduledFor, "EEE, PPP")}
            </span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="size-3.5" />
              {format(appt.scheduledFor, "p")} · {appt.durationMin} min
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            {appt.provider?.name && (
              <span className="flex items-center gap-1.5">
                <User className="size-3.5" /> {appt.provider.name}
              </span>
            )}
            {appt.reason && <span>· {appt.reason}</span>}
            <span className="font-mono text-xs">{appt.apptNo}</span>
          </div>
        </div>

        <div className="ml-auto">
          <StatusBadge state={appt.state} />
        </div>
      </CardContent>
    </Card>
  );
}
