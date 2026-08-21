import Link from "next/link";
import { formatDistanceToNow, addDays } from "date-fns";
import { Pill, AlertTriangle, PackageX, CalendarClock, Boxes } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { requireRole } from "@/server/session";
import { db } from "@/server/db";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Pharmacy" };

type OrderRow = Prisma.DrugOrderGetPayload<{ include: { items: true; visit: { include: { patient: true } } } }>;

function OrderList({ orders, empty }: { orders: OrderRow[]; empty: string }) {
  if (orders.length === 0) return <EmptyState title={empty} icon={Pill} className="m-4" />;
  return (
    <div className="divide-y divide-border">
      {orders.map((o) => (
        <Link key={o.id} href={`/pharmacy/${o.id}`} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/50">
          <div>
            <div className="font-medium">{o.visit.patient.name}</div>
            <div className="text-xs text-muted-foreground">
              <span className="font-mono">{o.orderNo}</span> · {o.items.length} item(s) · {formatDistanceToNow(o.createdAt, { addSuffix: true })}
            </div>
          </div>
          <StatusBadge state={o.state} />
        </Link>
      ))}
    </div>
  );
}

export default async function PharmacyPage() {
  await requireRole("PHARMACIST");

  const [toDispense, completed, meds, expiring] = await Promise.all([
    db.drugOrder.findMany({
      where: { state: { in: ["ORDERED", "PARTIALLY_DISPENSED"] } },
      include: { items: true, visit: { include: { patient: true } } },
      orderBy: { createdAt: "asc" },
    }),
    db.drugOrder.findMany({
      where: { state: "DISPENSED" },
      include: { items: true, visit: { include: { patient: true } } },
      orderBy: { updatedAt: "desc" },
      take: 20,
    }),
    db.medication.findMany({ include: { batches: true } }),
    db.medicationBatch.count({ where: { expiryDate: { lte: addDays(new Date(), 60) }, quantity: { gt: 0 } } }),
  ]);

  const lowStock = meds.filter((m) => m.batches.reduce((s, b) => s + b.quantity, 0) <= m.reorderLevel).length;
  const outOfStock = meds.filter((m) => m.batches.reduce((s, b) => s + b.quantity, 0) === 0).length;
  const stockValue = meds.reduce((sum, m) => sum + m.batches.reduce((s, b) => s + b.quantity * b.sellPrice, 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pharmacy"
        description="Dispense prescriptions and keep the medicine store stocked."
        icon={Pill}
        actions={
          <Button asChild variant="primary">
            <Link href="/pharmacy/inventory">
              <Boxes className="size-4" /> Inventory
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Stock value (ETB)" value={stockValue.toLocaleString()} icon={Boxes} tone="brand" href="/pharmacy/inventory" />
        <StatCard label="Low stock items" value={lowStock} icon={AlertTriangle} tone={lowStock ? "warning" : "success"} href="/pharmacy/inventory" />
        <StatCard label="Out of stock" value={outOfStock} icon={PackageX} tone={outOfStock ? "danger" : "success"} href="/pharmacy/inventory" />
        <StatCard label="Expiring ≤60d" value={expiring} icon={CalendarClock} tone={expiring ? "warning" : "success"} href="/pharmacy/inventory" />
      </div>

      <Tabs defaultValue="queue">
        <TabsList>
          <TabsTrigger value="queue">To dispense ({toDispense.length})</TabsTrigger>
          <TabsTrigger value="done">Dispensed ({completed.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="queue">
          <Card><CardContent className="p-0"><OrderList orders={toDispense} empty="No prescriptions to dispense" /></CardContent></Card>
        </TabsContent>
        <TabsContent value="done">
          <Card><CardContent className="p-0"><OrderList orders={completed} empty="Nothing dispensed yet" /></CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
