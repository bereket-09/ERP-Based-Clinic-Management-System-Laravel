import Link from "next/link";
import {
  addDays,
  endOfDay,
  format,
  isToday,
  parseISO,
  startOfDay,
  subDays,
} from "date-fns";
import {
  CalendarClock,
  CalendarDays,
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  LogIn,
  UserX,
} from "lucide-react";
import type { Prisma } from "@prisma/client";
import { requireRole } from "@/server/session";
import { db } from "@/server/db";
import { appointmentAffordances } from "@/server/services/appointment";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AppointmentActions } from "./[id]/appointment-actions";

export const metadata = { title: "Appointments" };

const selectCls =
  "flex h-10 w-full rounded-lg border border-input bg-card px-3 text-sm shadow-sm focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/40 outline-none";

type ApptRow = Prisma.AppointmentGetPayload<{
  include: { patient: true; provider: true };
}>;

function parseDate(raw?: string): Date {
  if (raw) {
    const d = parseISO(raw);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return new Date();
}

function ymd(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

function withParams(date: Date, provider?: string): string {
  const q = new URLSearchParams({ date: ymd(date) });
  if (provider) q.set("provider", provider);
  return `/appointments?${q.toString()}`;
}

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; provider?: string }>;
}) {
  const actor = await requireRole("RECEPTIONIST", "DOCTOR", "NURSE");
  const { date: dateParam, provider } = await searchParams;

  const day = parseDate(dateParam);
  const dayStart = startOfDay(day);
  const dayEnd = endOfDay(day);

  const providerFilter = provider
    ? { providerId: provider }
    : ({} as Prisma.AppointmentWhereInput);

  const [dayAppts, upcoming, providers] = await Promise.all([
    db.appointment.findMany({
      where: { scheduledFor: { gte: dayStart, lte: dayEnd }, ...providerFilter },
      include: { patient: true, provider: true },
      orderBy: { scheduledFor: "asc" },
    }),
    db.appointment.findMany({
      where: {
        scheduledFor: { gt: dayEnd, lte: endOfDay(addDays(day, 7)) },
        state: { in: ["SCHEDULED", "CONFIRMED"] },
        ...providerFilter,
      },
      include: { patient: true, provider: true },
      orderBy: { scheduledFor: "asc" },
      take: 30,
    }),
    db.user.findMany({
      where: { role: "DOCTOR", isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const total = dayAppts.length;
  const checkedIn = dayAppts.filter((a) => a.state === "CHECKED_IN").length;
  const stillUpcoming = dayAppts.filter((a) => a.state === "SCHEDULED" || a.state === "CONFIRMED").length;
  const noShows = dayAppts.filter((a) => a.state === "NO_SHOW").length;

  // Group upcoming by calendar day for the "next 7 days" section.
  const upcomingByDay = new Map<string, ApptRow[]>();
  for (const a of upcoming) {
    const key = ymd(a.scheduledFor);
    const list = upcomingByDay.get(key) ?? [];
    list.push(a);
    upcomingByDay.set(key, list);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Appointments"
        description="Day agenda, check-ins, and the week ahead."
        icon={CalendarDays}
        actions={
          <Button asChild variant="primary">
            <Link href="/appointments/new">
              <CalendarPlus /> Book appointment
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Scheduled today" value={total} icon={CalendarDays} tone="brand" />
        <StatCard label="Checked in" value={checkedIn} icon={LogIn} tone="info" />
        <StatCard label="Still upcoming" value={stillUpcoming} icon={CalendarClock} tone="warning" />
        <StatCard label="No-shows" value={noShows} icon={UserX} tone="danger" />
      </div>

      {/* Date + provider controls */}
      <Card>
        <CardContent className="flex flex-col gap-4 p-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="icon-sm" aria-label="Previous day">
              <Link href={withParams(subDays(day, 1), provider)}>
                <ChevronLeft />
              </Link>
            </Button>
            <div>
              <div className="text-lg font-semibold tracking-tight">
                {format(day, "EEEE, d MMMM yyyy")}
                {isToday(day) && (
                  <span className="ml-2 align-middle text-xs font-medium text-primary">Today</span>
                )}
              </div>
              {!isToday(day) && (
                <Link
                  href={withParams(new Date(), provider)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Jump to today
                </Link>
              )}
            </div>
            <Button asChild variant="outline" size="icon-sm" aria-label="Next day">
              <Link href={withParams(addDays(day, 1), provider)}>
                <ChevronRight />
              </Link>
            </Button>
          </div>

          <form method="GET" action="/appointments" className="flex flex-wrap items-end gap-2">
            <input type="hidden" name="date" value={ymd(day)} />
            <div className="space-y-1.5">
              <Label htmlFor="provider" className="text-xs text-muted-foreground">
                Provider
              </Label>
              <select id="provider" name="provider" className={selectCls} defaultValue={provider ?? ""}>
                <option value="">All providers</option>
                {providers.map((p) => (
                  <option key={p.id} value={p.id}>
                    Dr. {p.name}
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit" variant="outline">
              Apply
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Day agenda */}
      <Card>
        <CardHeader>
          <CardTitle>Agenda</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {dayAppts.length === 0 ? (
            <EmptyState
              title="No appointments"
              description="Nothing scheduled for this day and provider."
              icon={CalendarDays}
              className="m-4"
              action={
                <Button asChild variant="outline" size="sm">
                  <Link href="/appointments/new">
                    <CalendarPlus /> Book appointment
                  </Link>
                </Button>
              }
            />
          ) : (
            <ul className="divide-y divide-border">
              {dayAppts.map((a) => (
                <AgendaRow key={a.id} appt={a} actorRole={appointmentAffordances(a.state, actor)} />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Upcoming — next 7 days */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming · next 7 days</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {upcoming.length === 0 ? (
            <EmptyState title="Nothing on the horizon" icon={CalendarClock} />
          ) : (
            [...upcomingByDay.entries()].map(([key, list]) => {
              const d = parseISO(key);
              return (
                <div key={key}>
                  <Link
                    href={withParams(d, provider)}
                    className="mb-2 inline-block text-sm font-semibold hover:text-primary"
                  >
                    {format(d, "EEEE, d MMM")}
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                      {list.length} appointment{list.length === 1 ? "" : "s"}
                    </span>
                  </Link>
                  <ul className="space-y-1.5">
                    {list.map((a) => (
                      <li key={a.id}>
                        <Link
                          href={`/appointments/${a.id}`}
                          className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 hover:border-primary hover:bg-accent"
                        >
                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium">{a.patient.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {format(a.scheduledFor, "p")} · {a.durationMin} min ·{" "}
                              {a.provider ? `Dr. ${a.provider.name}` : "Any provider"}
                            </div>
                          </div>
                          <StatusBadge state={a.state} />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AgendaRow({
  appt,
  actorRole,
}: {
  appt: ApptRow;
  actorRole: ReturnType<typeof appointmentAffordances>;
}) {
  const past = appt.scheduledFor.getTime() < Date.now();
  return (
    <li className="flex flex-col gap-3 px-4 py-3 hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        {/* Time column */}
        <div className="w-16 shrink-0 text-center">
          <div className="text-base font-semibold tabular-nums">{format(appt.scheduledFor, "p")}</div>
          <div className="text-xs text-muted-foreground">{appt.durationMin} min</div>
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Link
              href={`/appointments/${appt.id}`}
              className="truncate font-medium hover:text-primary"
            >
              {appt.patient.name}
            </Link>
            <StatusBadge state={appt.state} />
          </div>
          <div className="truncate text-xs text-muted-foreground">
            <span className="font-mono">{appt.apptNo}</span> ·{" "}
            {appt.provider ? `Dr. ${appt.provider.name}` : "Any provider"}
            {appt.reason ? ` · ${appt.reason}` : ""}
            {past && !["COMPLETED", "CANCELLED", "NO_SHOW", "CHECKED_IN"].includes(appt.state)
              ? " · overdue"
              : ""}
          </div>
        </div>
      </div>
      <div className="sm:pl-4">
        <AppointmentActions appointmentId={appt.id} affordances={actorRole} layout="inline" />
      </div>
    </li>
  );
}
