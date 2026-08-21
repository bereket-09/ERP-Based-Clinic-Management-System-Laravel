import Link from "next/link";
import { CalendarClock, UserCheck, Users, PlaneTakeoff, ArrowRight } from "lucide-react";
import { requireRole } from "@/server/session";
import { db } from "@/server/db";
import { roleLabel } from "@/lib/rbac";
import { humanize } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";

export const metadata = { title: "HR" };

export default async function HrDashboardPage() {
  const actor = await requireRole("HR");

  const [pendingLeaves, onLeave, activeStaff, byRole, recentLeaves] = await Promise.all([
    db.leaveRequest.count({ where: { state: "SUBMITTED" } }),
    db.user.count({ where: { employmentStatus: "ON_LEAVE" } }),
    db.user.count({ where: { employmentStatus: "ACTIVE" } }),
    db.user.groupBy({ by: ["role"], _count: { _all: true } }),
    db.leaveRequest.findMany({
      include: { employee: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  const roles = [...byRole].sort((a, b) => b._count._all - a._count._all);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Human resources"
        description={`Leave, staffing and directory · ${roleLabel(actor.role)}`}
        icon={Users}
        actions={
          <Button asChild variant="primary">
            <Link href="/hr/leave">Leave requests</Link>
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Pending leave requests" value={pendingLeaves} icon={CalendarClock} tone={pendingLeaves > 0 ? "warning" : "success"} href="/hr/leave?state=SUBMITTED" />
        <StatCard label="Staff on leave" value={onLeave} icon={PlaneTakeoff} tone="info" href="/hr/leave?state=ACTIVE" />
        <StatCard label="Active staff" value={activeStaff} icon={UserCheck} tone="success" href="/staff" />
        <StatCard label="Roles in use" value={roles.length} icon={Users} tone="brand" href="/staff" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Recent leave requests</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/hr/leave">
                View all <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {recentLeaves.length === 0 ? (
              <EmptyState title="No leave requests yet" description="Requests submitted by staff will appear here for review." className="m-5" icon={CalendarClock} />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentLeaves.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell>
                        <Link href="/hr/leave" className="font-medium hover:text-primary">
                          {l.employee.name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{humanize(l.type)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {l.startDate.toLocaleDateString()} – {l.endDate.toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <StatusBadge state={l.state} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Staff by role</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            {roles.length === 0 ? (
              <p className="text-sm text-muted-foreground">No staff records.</p>
            ) : (
              roles.map((r) => (
                <div
                  key={r.role}
                  className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5 text-sm"
                >
                  <span>{roleLabel(r.role)}</span>
                  <span className="font-semibold text-foreground">{r._count._all}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
