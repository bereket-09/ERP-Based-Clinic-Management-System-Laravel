import { CalendarRange } from "lucide-react";
import { requireRole } from "@/server/session";
import { db } from "@/server/db";
import { roleLabel } from "@/lib/rbac";
import {
  shiftsForWeek,
  weekStartOf,
  weekDays,
  parseDay,
  toDayParam,
} from "@/server/services/hr-ops";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WeekNav, ShiftCell, type ShiftCellData } from "./roster-client";

export const metadata = { title: "Shift roster" };

export default async function RosterPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  await requireRole("HR", "MANAGER");
  const { week } = await searchParams;

  const weekStart = weekStartOf(parseDay(week));
  const days = weekDays(weekStart);
  const weekParam = toDayParam(weekStart);

  const [staff, shifts] = await Promise.all([
    db.user.findMany({
      where: { isActive: true },
      select: { id: true, name: true, role: true, title: true },
      orderBy: { name: "asc" },
    }),
    shiftsForWeek(weekStart),
  ]);

  // Map keyed by `${userId}|${yyyy-MM-dd}` → shift.
  const byCell = new Map<string, ShiftCellData>();
  for (const s of shifts) {
    byCell.set(`${s.userId}|${toDayParam(s.date)}`, {
      id: s.id,
      startTime: s.startTime,
      endTime: s.endTime,
      area: s.area,
      note: s.note,
    });
  }

  const rangeLabel = `${days[0].toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  })} – ${days[6].toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  })}`;

  const todayParam = toDayParam(new Date());

  return (
    <div className="space-y-6">
      <PageHeader
        title="Shift roster"
        description={`Weekly staffing plan · ${rangeLabel}`}
        icon={CalendarRange}
        actions={<WeekNav week={weekParam} />}
      />

      <Card>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full min-w-[900px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="sticky left-0 z-10 bg-card px-4 py-3 text-left font-medium text-muted-foreground">
                  Staff
                </th>
                {days.map((d) => {
                  const isToday = toDayParam(d) === todayParam;
                  return (
                    <th
                      key={d.toISOString()}
                      className="px-2 py-3 text-center font-medium text-muted-foreground"
                    >
                      <div className={isToday ? "text-primary" : undefined}>
                        {d.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" })}
                      </div>
                      <div className="text-xs font-normal">
                        {d.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          timeZone: "UTC",
                        })}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {staff.map((s) => (
                <tr key={s.id} className="border-b border-border last:border-0">
                  <td className="sticky left-0 z-10 bg-card px-4 py-2 align-middle">
                    <div className="font-medium">
                      {s.title ? `${s.title} ` : ""}
                      {s.name}
                    </div>
                    <Badge variant="outline" className="mt-1">
                      {roleLabel(s.role)}
                    </Badge>
                  </td>
                  {days.map((d) => {
                    const dateParam = toDayParam(d);
                    const dateLabel = d.toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      timeZone: "UTC",
                    });
                    return (
                      <td key={dateParam} className="px-1.5 py-1.5 align-middle">
                        <ShiftCell
                          userId={s.id}
                          userName={`${s.title ? `${s.title} ` : ""}${s.name}`}
                          dateParam={dateParam}
                          dateLabel={dateLabel}
                          shift={byCell.get(`${s.id}|${dateParam}`) ?? null}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
