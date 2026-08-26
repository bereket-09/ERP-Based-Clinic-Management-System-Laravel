import {
  Activity,
  AlertTriangle,
  BarChart3,
  BedDouble,
  CalendarClock,
  CheckCircle2,
  FlaskConical,
  Package,
  Pill,
  Send,
  Stethoscope,
  Wallet,
} from "lucide-react";
import { eachDayOfInterval, format, startOfDay, subDays } from "date-fns";
import type { Role } from "@prisma/client";
import { requireRole } from "@/server/session";
import { db } from "@/server/db";
import { humanize } from "@/lib/utils";
import { roleLabel } from "@/lib/rbac";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/empty-state";
import {
  CategoryBarChart,
  MiniBarChart,
  RankedBarChart,
  VisitsTrendChart,
  type SeriesPoint,
} from "./charts";

export const metadata = { title: "Reports & Analytics" };

const CURRENCY = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default async function ReportsPage() {
  await requireRole("MANAGER");

  const now = new Date();
  const windowStart = startOfDay(subDays(now, 13)); // inclusive 14-day window
  const expiryHorizon = subDays(now, -60); // 60 days from now

  const [
    totalVisits,
    completedVisits,
    activeAdmissions,
    openReferrals,
    visitsByState,
    recentVisits,
    diagnosisRows,
    labByState,
    drugByState,
    medications,
    staffByRole,
  ] = await Promise.all([
    db.visit.count(),
    db.visit.count({ where: { state: "COMPLETED" } }),
    db.admission.count({ where: { state: { in: ["ADMITTED", "ON_WARD"] } } }),
    db.referral.count({ where: { state: { in: ["ISSUED", "ACKNOWLEDGED"] } } }),
    db.visit.groupBy({ by: ["state"], _count: { _all: true } }),
    db.visit.findMany({
      where: { openedAt: { gte: windowStart } },
      select: { openedAt: true },
    }),
    db.visit.findMany({
      where: { diagnosis: { not: null } },
      select: { diagnosis: true },
    }),
    db.labOrder.groupBy({ by: ["state"], _count: { _all: true } }),
    db.drugOrder.groupBy({ by: ["state"], _count: { _all: true } }),
    db.medication.findMany({
      where: { isActive: true },
      include: { batches: true },
    }),
    db.user.groupBy({ by: ["role"], _count: { _all: true } }),
  ]);

  // ── Visits over the last 14 days (zero-filled) ───────────────────────────
  const days = eachDayOfInterval({ start: windowStart, end: startOfDay(now) });
  const perDay = new Map<string, number>();
  for (const v of recentVisits) {
    const key = format(v.openedAt, "yyyy-MM-dd");
    perDay.set(key, (perDay.get(key) ?? 0) + 1);
  }
  const visitsTrend: SeriesPoint[] = days.map((d) => ({
    label: format(d, "MMM d"),
    value: perDay.get(format(d, "yyyy-MM-dd")) ?? 0,
  }));
  const avgPerDay =
    visitsTrend.length > 0
      ? Math.round(
          (visitsTrend.reduce((s, p) => s + p.value, 0) / visitsTrend.length) * 10,
        ) / 10
      : 0;

  // ── Visits by state ──────────────────────────────────────────────────────
  const visitStateData: SeriesPoint[] = visitsByState
    .map((r) => ({ label: humanize(r.state), value: r._count._all }))
    .sort((a, b) => b.value - a.value);

  // ── Top diagnoses (counted in JS) ────────────────────────────────────────
  const diagnosisCounts = new Map<string, number>();
  for (const row of diagnosisRows) {
    const d = row.diagnosis?.trim();
    if (!d) continue;
    diagnosisCounts.set(d, (diagnosisCounts.get(d) ?? 0) + 1);
  }
  const topDiagnoses: SeriesPoint[] = [...diagnosisCounts.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  // ── Lab & pharmacy throughput ────────────────────────────────────────────
  const labData: SeriesPoint[] = labByState
    .map((r) => ({ label: humanize(r.state), value: r._count._all }))
    .sort((a, b) => b.value - a.value);
  const drugData: SeriesPoint[] = drugByState
    .map((r) => ({ label: humanize(r.state), value: r._count._all }))
    .sort((a, b) => b.value - a.value);

  // ── Pharmacy stock value & alerts ────────────────────────────────────────
  let stockValue = 0;
  const lowStock: { name: string; onHand: number; reorderLevel: number }[] = [];
  const expiringBatches: {
    name: string;
    batchNo: string;
    quantity: number;
    expiryDate: Date;
  }[] = [];
  for (const med of medications) {
    const onHand = med.batches.reduce((s, b) => s + b.quantity, 0);
    for (const b of med.batches) {
      stockValue += b.quantity * b.sellPrice;
      if (b.quantity > 0 && b.expiryDate <= expiryHorizon) {
        expiringBatches.push({
          name: `${med.name}${med.strength ? ` ${med.strength}` : ""}`,
          batchNo: b.batchNo,
          quantity: b.quantity,
          expiryDate: b.expiryDate,
        });
      }
    }
    if (onHand <= med.reorderLevel) {
      lowStock.push({
        name: `${med.name}${med.strength ? ` ${med.strength}` : ""}`,
        onHand,
        reorderLevel: med.reorderLevel,
      });
    }
  }
  lowStock.sort((a, b) => a.onHand - b.onHand);
  expiringBatches.sort((a, b) => a.expiryDate.getTime() - b.expiryDate.getTime());

  // ── Staff by role ────────────────────────────────────────────────────────
  const staffData: SeriesPoint[] = staffByRole
    .map((r) => ({ label: roleLabel(r.role as Role), value: r._count._all }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Reports & Analytics"
        description="Operational overview across visits, laboratory, pharmacy, and staffing."
        icon={BarChart3}
      />

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Total visits" value={totalVisits} icon={Stethoscope} tone="brand" />
        <StatCard
          label="Completed (all-time)"
          value={completedVisits}
          icon={CheckCircle2}
          tone="success"
        />
        <StatCard
          label="Avg visits / day"
          value={avgPerDay}
          hint="Last 14 days"
          icon={Activity}
          tone="info"
        />
        <StatCard
          label="Active admissions"
          value={activeAdmissions}
          icon={BedDouble}
          tone="info"
        />
        <StatCard label="Open referrals" value={openReferrals} icon={Send} tone="warning" />
      </div>

      {/* Trend + visits by state */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Visits over the last 14 days</CardTitle>
          </CardHeader>
          <CardContent>
            <VisitsTrendChart data={visitsTrend} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Visits by state</CardTitle>
          </CardHeader>
          <CardContent>
            {visitStateData.length === 0 ? (
              <EmptyState title="No visits yet" icon={Stethoscope} />
            ) : (
              <CategoryBarChart data={visitStateData} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top diagnoses + staff by role */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top diagnoses</CardTitle>
          </CardHeader>
          <CardContent>
            {topDiagnoses.length === 0 ? (
              <EmptyState
                title="No diagnoses recorded"
                description="Diagnoses entered during consultations will rank here."
                icon={Activity}
              />
            ) : (
              <RankedBarChart data={topDiagnoses} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Staff by role</CardTitle>
          </CardHeader>
          <CardContent>
            {staffData.length === 0 ? (
              <EmptyState title="No staff records" icon={Activity} />
            ) : (
              <CategoryBarChart data={staffData} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Lab & pharmacy throughput */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FlaskConical className="size-4 text-primary" /> Lab order throughput
            </CardTitle>
          </CardHeader>
          <CardContent>
            {labData.length === 0 ? (
              <EmptyState title="No lab orders" icon={FlaskConical} />
            ) : (
              <MiniBarChart data={labData} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pill className="size-4 text-primary" /> Prescription throughput
            </CardTitle>
          </CardHeader>
          <CardContent>
            {drugData.length === 0 ? (
              <EmptyState title="No prescriptions" icon={Pill} />
            ) : (
              <MiniBarChart data={drugData} color="#e0a112" />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pharmacy stock value & alerts */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total stock value"
          value={CURRENCY.format(stockValue)}
          hint="Quantity × sell price"
          icon={Wallet}
          tone="brand"
        />
        <StatCard
          label="At / below reorder level"
          value={lowStock.length}
          icon={AlertTriangle}
          tone={lowStock.length > 0 ? "danger" : "success"}
        />
        <StatCard
          label="Batches expiring ≤ 60d"
          value={expiringBatches.length}
          icon={CalendarClock}
          tone={expiringBatches.length > 0 ? "warning" : "success"}
        />
        <StatCard
          label="Active medications"
          value={medications.length}
          icon={Package}
          tone="info"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Reorder alerts</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {lowStock.length === 0 ? (
              <EmptyState
                title="Stock levels healthy"
                description="No medications are at or below their reorder level."
                icon={CheckCircle2}
                className="m-5"
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Medication</TableHead>
                    <TableHead className="text-right">On hand</TableHead>
                    <TableHead className="text-right">Reorder level</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowStock.map((m) => (
                    <TableRow key={m.name}>
                      <TableCell className="font-medium">{m.name}</TableCell>
                      <TableCell className="text-right font-mono">{m.onHand}</TableCell>
                      <TableCell className="text-right font-mono text-muted-foreground">
                        {m.reorderLevel}
                      </TableCell>
                      <TableCell className="text-right">
                        <StatusBadge state={m.onHand === 0 ? "OUT_OF_STOCK" : "LOW"} />
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
            <CardTitle>Batches expiring within 60 days</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {expiringBatches.length === 0 ? (
              <EmptyState
                title="No near-term expiries"
                description="No in-stock batches expire in the next 60 days."
                icon={CheckCircle2}
                className="m-5"
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Medication</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Expires</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expiringBatches.map((b) => (
                    <TableRow key={`${b.name}-${b.batchNo}`}>
                      <TableCell className="font-medium">{b.name}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {b.batchNo}
                      </TableCell>
                      <TableCell className="text-right font-mono">{b.quantity}</TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {format(b.expiryDate, "MMM d, yyyy")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
