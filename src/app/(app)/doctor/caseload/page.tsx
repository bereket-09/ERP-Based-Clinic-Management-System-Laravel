import Link from "next/link";
import {
  eachDayOfInterval,
  format,
  formatDistanceToNow,
  startOfDay,
  startOfWeek,
  subDays,
} from "date-fns";
import type { Prisma } from "@prisma/client";
import {
  Activity,
  CalendarDays,
  ClipboardCheck,
  FlaskConical,
  ListChecks,
  Pill,
  Stethoscope,
  Users,
} from "lucide-react";
import { requireRole } from "@/server/session";
import { db } from "@/server/db";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { ConsultationsBarChart, type DayPoint } from "./chart";
import { DoctorFilter } from "./caseload-filter";

export const metadata = { title: "Caseload & Productivity" };

const ACTIVE_STATES: Prisma.EnumVisitStateFilter = {
  notIn: ["COMPLETED", "CANCELLED"],
};

function fmtDate(d: Date | null): string {
  if (!d) return "—";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function CaseloadPage({
  searchParams,
}: {
  searchParams: Promise<{ doctor?: string }>;
}) {
  const actor = await requireRole("DOCTOR", "MANAGER");
  const isManager = actor.role === "MANAGER";
  const { doctor } = await searchParams;

  // A doctor always sees their own caseload; a manager may filter by doctor or go clinic-wide.
  const doctorFilter = isManager ? (doctor || undefined) : actor.id;

  const visitWhere: Prisma.VisitWhereInput = doctorFilter ? { doctorId: doctorFilter } : {};
  const labWhere: Prisma.LabOrderWhereInput = doctorFilter ? { orderedById: doctorFilter } : {};
  const rxWhere: Prisma.DrugOrderWhereInput = doctorFilter ? { prescribedById: doctorFilter } : {};

  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const last7 = subDays(now, 7);
  const chartStart = startOfDay(subDays(now, 13)); // 14 daily buckets, inclusive of today

  const [
    openVisits,
    recentCompleted,
    completedThisWeek,
    completedLast7,
    labsOrdered,
    prescriptions,
    completedRecent,
    doctors,
  ] = await Promise.all([
    db.visit.findMany({
      where: { ...visitWhere, state: ACTIVE_STATES },
      include: { patient: true },
      orderBy: [{ priority: "desc" }, { openedAt: "asc" }],
    }),
    db.visit.findMany({
      where: { ...visitWhere, state: "COMPLETED" },
      include: { patient: true },
      orderBy: { closedAt: "desc" },
      take: 15,
    }),
    db.visit.count({ where: { ...visitWhere, state: "COMPLETED", closedAt: { gte: weekStart } } }),
    db.visit.count({ where: { ...visitWhere, state: "COMPLETED", closedAt: { gte: last7 } } }),
    db.labOrder.count({ where: labWhere }),
    db.drugOrder.count({ where: rxWhere }),
    // Last-90-day completed visits power both the daily chart and the top-diagnoses list.
    db.visit.findMany({
      where: { ...visitWhere, state: "COMPLETED", closedAt: { gte: subDays(now, 90) } },
      select: { closedAt: true, diagnosis: true },
    }),
    isManager
      ? db.user.findMany({
          where: { role: "DOCTOR", isActive: true },
          select: { id: true, name: true, title: true },
          orderBy: { name: "asc" },
        })
      : Promise.resolve([]),
  ]);

  const avgPerDay = (completedLast7 / 7).toFixed(1);

  // Bucket completed visits by day for the 14-day bar chart.
  const bucket = new Map<string, number>();
  for (const d of eachDayOfInterval({ start: chartStart, end: now })) {
    bucket.set(format(d, "yyyy-MM-dd"), 0);
  }
  for (const v of completedRecent) {
    if (!v.closedAt) continue;
    const key = format(v.closedAt, "yyyy-MM-dd");
    if (bucket.has(key)) bucket.set(key, (bucket.get(key) ?? 0) + 1);
  }
  const chartData: DayPoint[] = Array.from(bucket.entries()).map(([key, value]) => ({
    label: format(new Date(`${key}T00:00:00`), "MMM d"),
    value,
  }));

  // Top diagnoses from completed visits (grouped in JS).
  const diagCounts = new Map<string, number>();
  for (const v of completedRecent) {
    const dx = v.diagnosis?.trim();
    if (!dx) continue;
    diagCounts.set(dx, (diagCounts.get(dx) ?? 0) + 1);
  }
  const topDiagnoses = Array.from(diagCounts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const scopeLabel = isManager
    ? doctorFilter
      ? doctors.find((d) => d.id === doctorFilter)?.name ?? "Selected doctor"
      : "Clinic-wide"
    : "Your caseload";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Caseload & Productivity"
        description={`${scopeLabel} — active workload, throughput, and diagnostic mix.`}
        icon={Activity}
        actions={
          isManager ? (
            <DoctorFilter
              doctors={doctors.map((d) => ({
                id: d.id,
                label: d.title ? `${d.title} ${d.name}` : d.name,
              }))}
              selected={doctorFilter ?? null}
            />
          ) : undefined
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Active patients" value={openVisits.length} icon={Users} tone="brand" />
        <StatCard
          label="Completed this week"
          value={completedThisWeek}
          icon={ClipboardCheck}
          tone="success"
        />
        <StatCard
          label="Avg consults / day"
          value={avgPerDay}
          hint="Last 7 days"
          icon={CalendarDays}
          tone="info"
        />
        <StatCard label="Labs ordered" value={labsOrdered} icon={FlaskConical} tone="warning" />
        <StatCard label="Prescriptions" value={prescriptions} icon={Pill} tone="brand" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Consultations — last 14 days</CardTitle>
          </CardHeader>
          <CardContent>
            <ConsultationsBarChart data={chartData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top diagnoses</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {topDiagnoses.length === 0 ? (
              <EmptyState title="No diagnoses recorded" icon={ListChecks} />
            ) : (
              <ol className="space-y-3">
                {topDiagnoses.map((d, i) => (
                  <li key={d.label} className="flex items-center gap-3">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                      {i + 1}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm">{d.label}</span>
                    <span className="text-sm font-semibold tabular-nums text-muted-foreground">
                      {d.count}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="open">
        <TabsList>
          <TabsTrigger value="open">Open ({openVisits.length})</TabsTrigger>
          <TabsTrigger value="completed">Recently completed</TabsTrigger>
        </TabsList>

        <TabsContent value="open">
          <Card>
            <CardContent className="p-0">
              {openVisits.length === 0 ? (
                <EmptyState
                  title="No active visits"
                  description="Open encounters assigned here will appear in this list."
                  icon={Stethoscope}
                  className="m-4"
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>Visit</TableHead>
                      <TableHead>State</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead className="text-right">Opened</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {openVisits.map((v) => (
                      <TableRow key={v.id}>
                        <TableCell>
                          <Link href={`/visits/${v.id}`} className="font-medium hover:underline">
                            {v.patient.name}
                          </Link>
                          <div className="text-xs text-muted-foreground">{v.patient.mrn}</div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{v.visitNo}</TableCell>
                        <TableCell>
                          <StatusBadge state={v.state} />
                        </TableCell>
                        <TableCell>
                          {v.priority === "ROUTINE" ? (
                            <span className="text-xs text-muted-foreground">Routine</span>
                          ) : (
                            <StatusBadge state={v.priority} />
                          )}
                        </TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">
                          {formatDistanceToNow(v.openedAt, { addSuffix: true })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed">
          <Card>
            <CardContent className="p-0">
              {recentCompleted.length === 0 ? (
                <EmptyState
                  title="No completed visits yet"
                  icon={ClipboardCheck}
                  className="m-4"
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>Visit</TableHead>
                      <TableHead>Diagnosis</TableHead>
                      <TableHead className="text-right">Completed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentCompleted.map((v) => (
                      <TableRow key={v.id}>
                        <TableCell>
                          <Link href={`/visits/${v.id}`} className="font-medium hover:underline">
                            {v.patient.name}
                          </Link>
                          <div className="text-xs text-muted-foreground">{v.patient.mrn}</div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{v.visitNo}</TableCell>
                        <TableCell>
                          {v.diagnosis?.trim() ? (
                            <span className="text-sm">{v.diagnosis}</span>
                          ) : (
                            <span className="text-xs text-muted-foreground">Not recorded</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">
                          {fmtDate(v.closedAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
