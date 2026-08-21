import Link from "next/link";
import { startOfDay } from "date-fns";
import {
  Stethoscope,
  FlaskConical,
  Pill,
  Users,
  BedDouble,
  CalendarClock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { requireStaff } from "@/server/session";
import { db } from "@/server/db";
import { roleLabel } from "@/lib/rbac";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Dashboard" };

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  const actor = await requireStaff();

  const [byState, completedToday, labOrders, drugOrders, pendingLeaves, admitted, lowStock, activeVisits] =
    await Promise.all([
      db.visit.groupBy({ by: ["state"], _count: { _all: true } }),
      db.visit.count({ where: { state: "COMPLETED", closedAt: { gte: startOfDay(new Date()) } } }),
      db.labOrder.count({ where: { state: { in: ["ORDERED", "COLLECTING", "IN_PROGRESS"] } } }),
      db.drugOrder.count({ where: { state: { in: ["ORDERED", "PARTIALLY_DISPENSED"] } } }),
      db.leaveRequest.count({ where: { state: "SUBMITTED" } }),
      db.admission.count({ where: { state: { in: ["ADMITTED", "ON_WARD"] } } }),
      db.medication.findMany({ include: { batches: true } }),
      db.visit.findMany({
        where: { state: { notIn: ["COMPLETED", "CANCELLED"] } },
        include: { patient: true, doctor: true },
        orderBy: { openedAt: "desc" },
        take: 8,
      }),
    ]);

  const count = (s: string) => byState.find((r) => r.state === s)?._count._all ?? 0;
  const lowStockCount = lowStock.filter(
    (m) => m.batches.reduce((sum, b) => sum + b.quantity, 0) <= m.reorderLevel,
  ).length;

  const firstName =
    actor.name.replace(/^(Dr|Sr|Mr|Mrs|Ms|Prof)\.?\s+/i, "").split(" ")[0] || actor.name;

  return (
    <div className="space-y-8">
      <PageHeader
        title={`${greeting()}, ${firstName}`}
        description={`Here’s what’s happening across the clinic today · ${roleLabel(actor.role)}`}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Waiting for doctor" value={count("WAITING_FOR_DOCTOR")} icon={Stethoscope} tone="warning" href="/doctor" />
        <StatCard label="In consultation" value={count("IN_CONSULTATION")} icon={Users} tone="info" href="/doctor" />
        <StatCard label="Awaiting lab" value={count("WAITING_FOR_LAB")} icon={FlaskConical} tone="brand" href="/lab" />
        <StatCard label="Awaiting pharmacy" value={count("WAITING_FOR_PHARMACY")} icon={Pill} tone="brand" href="/pharmacy" />
        <StatCard label="Lab results ready" value={count("LAB_RESULTS_READY")} icon={CheckCircle2} tone="success" href="/doctor" />
        <StatCard label="Admitted (wards)" value={admitted} icon={BedDouble} tone="info" href="/wards" />
        <StatCard label="Completed today" value={completedToday} icon={CalendarClock} tone="success" />
        <StatCard
          label="Low / out of stock"
          value={lowStockCount}
          icon={AlertTriangle}
          tone={lowStockCount > 0 ? "danger" : "success"}
          href="/pharmacy"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Active patient queue</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/patients">
                View all <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {activeVisits.length === 0 ? (
              <EmptyState title="No active visits" description="New visits will appear here as reception registers patients." className="m-5" icon={Users} />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead className="text-right">Visit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeVisits.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell>
                        <Link href={`/visits/${v.id}`} className="font-medium hover:text-primary">
                          {v.patient.name}
                        </Link>
                        <div className="text-xs text-muted-foreground">{v.patient.mrn}</div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge state={v.state} />
                      </TableCell>
                      <TableCell className="text-muted-foreground">{v.doctor?.name ?? "—"}</TableCell>
                      <TableCell className="text-right font-mono text-xs text-muted-foreground">{v.visitNo}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <QuickAction href="/reception" label="Register / find a patient" />
            <QuickAction href="/doctor" label="Open my consultation queue" />
            <QuickAction href="/lab" label="Laboratory worklist" />
            <QuickAction href="/pharmacy" label="Dispensing queue" />
            <QuickAction href="/hr/leave" label="Leave requests" />
            {pendingLeaves > 0 && (
              <p className="mt-1 text-xs text-warning">{pendingLeaves} leave request(s) awaiting decision.</p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              {labOrders} open lab order(s) · {drugOrders} prescription(s) to dispense.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function QuickAction({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5 text-sm transition-colors hover:border-primary hover:bg-accent"
    >
      {label}
      <ArrowRight className="size-4 text-muted-foreground" />
    </Link>
  );
}
