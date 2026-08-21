import Link from "next/link";
import { addDays, startOfDay } from "date-fns";
import {
  Pill,
  AlertTriangle,
  Boxes,
  Truck,
  ClipboardList,
  PackageCheck,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import type { Prisma } from "@prisma/client";
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
import { Button } from "@/components/ui/button";
import { initials } from "@/lib/utils";
import { PriorityPill, ageLabel, ageClass } from "@/components/pharmacy/pharmacy-bits";
import { StockAlerts, type AlertBatch, type AlertMed } from "@/components/pharmacy/stock-alerts";

export const metadata = { title: "Pharmacy" };

type OrderRow = Prisma.DrugOrderGetPayload<{
  include: {
    items: true;
    prescribedBy: true;
    visit: { include: { patient: true } };
  };
}>;

function outstandingUnits(o: OrderRow) {
  return o.items.reduce((s, i) => s + Math.max(0, i.quantity - i.dispensedQty), 0);
}

function Worklist({ orders, mode }: { orders: OrderRow[]; mode: "queue" | "done" }) {
  if (orders.length === 0) {
    return (
      <EmptyState
        title={mode === "queue" ? "Queue is clear" : "Nothing dispensed today"}
        description={
          mode === "queue"
            ? "New prescriptions from doctors will appear here to dispense."
            : "Prescriptions you dispense today will be listed here."
        }
        icon={mode === "queue" ? PackageCheck : Pill}
        className="m-4"
      />
    );
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Patient</TableHead>
          <TableHead>Prescriber</TableHead>
          <TableHead className="text-right">Items</TableHead>
          <TableHead className="text-right">Units</TableHead>
          <TableHead>{mode === "queue" ? "Waiting" : "Dispensed"}</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Status</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((o) => {
          const units =
            mode === "queue" ? outstandingUnits(o) : o.items.reduce((s, i) => s + i.dispensedQty, 0);
          const stamp = mode === "queue" ? o.createdAt : o.updatedAt;
          return (
            <TableRow key={o.id} className="group cursor-pointer">
              <TableCell>
                <Link href={`/pharmacy/${o.id}`} className="flex items-center gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
                    {initials(o.visit.patient.name)}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-foreground group-hover:text-primary">
                      {o.visit.patient.name}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      <span className="font-mono">{o.visit.patient.mrn}</span> · {o.orderNo}
                    </span>
                  </span>
                </Link>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">{o.prescribedBy?.name ?? "—"}</TableCell>
              <TableCell className="text-right tabular-nums">{o.items.length}</TableCell>
              <TableCell className="text-right font-medium tabular-nums">{units}</TableCell>
              <TableCell className={mode === "queue" ? ageClass(stamp) : "text-muted-foreground"}>
                <span className="tabular-nums">{ageLabel(stamp)}</span>
                {mode === "queue" && <span className="text-muted-foreground"> ago</span>}
              </TableCell>
              <TableCell>
                <PriorityPill priority={o.visit.priority} />
              </TableCell>
              <TableCell>
                <StatusBadge state={o.state} />
              </TableCell>
              <TableCell className="text-right">
                <Link
                  href={`/pharmacy/${o.id}`}
                  className="inline-flex text-muted-foreground opacity-0 transition group-hover:opacity-100"
                >
                  <ChevronRight className="size-4" />
                </Link>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

export default async function PharmacyPage() {
  await requireRole("PHARMACIST");
  const now = new Date();
  const todayStart = startOfDay(now);
  const in90 = addDays(now, 90);

  const [toDispense, completed, dispensedToday, meds, stockBatches] = await Promise.all([
    db.drugOrder.findMany({
      where: { state: { in: ["ORDERED", "PARTIALLY_DISPENSED"] } },
      include: { items: true, prescribedBy: true, visit: { include: { patient: true } } },
      orderBy: [{ visit: { priority: "desc" } }, { createdAt: "asc" }],
    }),
    db.drugOrder.findMany({
      where: { state: "DISPENSED", updatedAt: { gte: todayStart } },
      include: { items: true, prescribedBy: true, visit: { include: { patient: true } } },
      orderBy: { updatedAt: "desc" },
      take: 25,
    }),
    db.drugOrder.count({ where: { state: "DISPENSED", updatedAt: { gte: todayStart } } }),
    db.medication.findMany({ include: { batches: true } }),
    db.medicationBatch.findMany({
      where: { quantity: { gt: 0 }, expiryDate: { lte: in90 } },
      include: { medication: true },
      orderBy: { expiryDate: "asc" },
    }),
  ]);

  // ── Stock health ──────────────────────────────────────────────────────────
  const lowStockMeds: AlertMed[] = meds
    .map((m) => ({
      id: m.id,
      name: m.name,
      strength: m.strength,
      unit: m.unit,
      reorderLevel: m.reorderLevel,
      onHand: m.batches.reduce((s, b) => s + b.quantity, 0),
    }))
    .filter((m) => m.onHand <= m.reorderLevel)
    .sort((a, b) => a.onHand - b.onHand);

  const toAlert = (b: (typeof stockBatches)[number]): AlertBatch => ({
    id: b.id,
    batchNo: b.batchNo,
    medicationId: b.medicationId,
    medicationName: b.medication.name,
    quantity: b.quantity,
    unit: b.medication.unit,
    expiryDate: b.expiryDate,
  });
  const expiredBatches = stockBatches.filter((b) => b.expiryDate < now).map(toAlert);
  const expiringBatches = stockBatches.filter((b) => b.expiryDate >= now).map(toAlert);

  const alertsTotal = expiredBatches.length + expiringBatches.length + lowStockMeds.length;
  const urgentQueue = toDispense.filter((o) => o.visit.priority !== "ROUTINE").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pharmacy station"
        description="Dispense prescriptions and keep the medicine store safe, stocked and in date."
        icon={Pill}
        actions={
          <>
            <Button asChild variant="default">
              <Link href="/pharmacy/suppliers">
                <Truck className="size-4" /> Suppliers
              </Link>
            </Button>
            <Button asChild variant="primary">
              <Link href="/pharmacy/inventory">
                <Boxes className="size-4" /> Inventory
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Awaiting dispensing"
          value={toDispense.length}
          hint={urgentQueue ? `${urgentQueue} urgent / emergency` : "All routine"}
          icon={ClipboardList}
          tone={toDispense.length ? "warning" : "success"}
        />
        <StatCard label="Dispensed today" value={dispensedToday} icon={PackageCheck} tone="success" />
        <StatCard
          label="Low / out of stock"
          value={lowStockMeds.length}
          icon={AlertTriangle}
          tone={lowStockMeds.length ? "danger" : "success"}
          href="/pharmacy/inventory"
        />
        <StatCard
          label="Stock alerts"
          value={alertsTotal}
          hint={`${expiredBatches.length} expired · ${expiringBatches.length} expiring`}
          icon={ShieldAlert}
          tone={expiredBatches.length ? "danger" : alertsTotal ? "warning" : "success"}
        />
      </div>

      <Tabs defaultValue="queue">
        <TabsList>
          <TabsTrigger value="queue">
            <ClipboardList className="size-4" /> To dispense ({toDispense.length})
          </TabsTrigger>
          <TabsTrigger value="done">
            <PackageCheck className="size-4" /> Dispensed today ({dispensedToday})
          </TabsTrigger>
          <TabsTrigger value="alerts">
            <ShieldAlert className="size-4" /> Stock alerts ({alertsTotal})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="queue">
          <Card>
            <CardHeader className="flex-row items-center justify-between gap-2 border-b border-border pb-4">
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="size-4 text-primary" /> Dispensing worklist
              </CardTitle>
              <span className="text-xs text-muted-foreground">Highest priority, longest waiting first</span>
            </CardHeader>
            <CardContent className="p-0">
              <Worklist orders={toDispense} mode="queue" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="done">
          <Card>
            <CardContent className="p-0">
              <Worklist orders={completed} mode="done" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <StockAlerts expired={expiredBatches} expiring={expiringBatches} lowStock={lowStockMeds} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
