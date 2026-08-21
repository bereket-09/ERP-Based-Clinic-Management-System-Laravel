import { CalendarCheck, UserCheck, UserX, Clock, PlaneTakeoff } from "lucide-react";
import { requireRole } from "@/server/session";
import { db } from "@/server/db";
import { roleLabel } from "@/lib/rbac";
import { attendanceForDate, parseDay, toDayParam } from "@/server/services/hr-ops";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { AttendanceDateNav, StatusSelect, ClockButton } from "./attendance-client";

export const metadata = { title: "Attendance" };

function fmtTime(d: Date | null): string {
  if (!d) return "—";
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  await requireRole("HR", "MANAGER");
  const { date } = await searchParams;

  const day = parseDay(date);
  const dayParam = toDayParam(day);
  const todayParam = toDayParam(new Date());
  const isToday = dayParam === todayParam;

  const [staff, records] = await Promise.all([
    db.user.findMany({
      where: { isActive: true },
      select: { id: true, name: true, role: true, title: true },
      orderBy: { name: "asc" },
    }),
    attendanceForDate(day),
  ]);

  const byUser = new Map(records.map((r) => [r.userId, r]));

  const counts = {
    present: records.filter((r) => r.status === "PRESENT").length,
    absent: records.filter((r) => r.status === "ABSENT").length,
    late: records.filter((r) => r.status === "LATE").length,
    onLeave: records.filter((r) => r.status === "ON_LEAVE").length,
  };

  const heading = day.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance"
        description={`${heading}${isToday ? " · Today" : ""}`}
        icon={CalendarCheck}
        actions={<AttendanceDateNav date={dayParam} />}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Present" value={counts.present} icon={UserCheck} tone="success" />
        <StatCard label="Absent" value={counts.absent} icon={UserX} tone="danger" />
        <StatCard label="Late" value={counts.late} icon={Clock} tone="warning" />
        <StatCard label="On leave" value={counts.onLeave} icon={PlaneTakeoff} tone="info" />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Clock in</TableHead>
                <TableHead>Clock out</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff.map((s) => {
                const rec = byUser.get(s.id);
                return (
                  <TableRow key={s.id}>
                    <TableCell>
                      <div className="font-medium">
                        {s.title ? `${s.title} ` : ""}
                        {s.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{roleLabel(s.role)}</Badge>
                    </TableCell>
                    <TableCell>
                      <StatusSelect userId={s.id} date={dayParam} status={rec?.status ?? null} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">{fmtTime(rec?.clockIn ?? null)}</TableCell>
                    <TableCell className="text-muted-foreground">{fmtTime(rec?.clockOut ?? null)}</TableCell>
                    <TableCell className="text-right">
                      {isToday ? (
                        <ClockButton
                          userId={s.id}
                          hasClockIn={!!rec?.clockIn}
                          hasClockOut={!!rec?.clockOut}
                        />
                      ) : rec ? (
                        <StatusBadge state={rec.status} />
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
