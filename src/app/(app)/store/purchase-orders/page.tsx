import Link from "next/link";
import { format } from "date-fns";
import {
  ShoppingCart,
  ArrowLeft,
  ArrowRight,
  PackageCheck,
  Hourglass,
  Coins,
  ClipboardList,
} from "lucide-react";
import type { PurchaseOrderState } from "@prisma/client";
import { requireRole } from "@/server/session";
import { db } from "@/server/db";
import { birr } from "@/lib/money";
import { PageHeader } from "@/components/page-header";
import { MetricTile } from "@/components/dashboard/metric-tile";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { ProgressBar } from "@/components/store/progress-bar";

export const metadata = { title: "Purchase orders" };

const TABS: { value: string; label: string; states?: PurchaseOrderState[] }[] = [
  { value: "all", label: "All" },
  { value: "open", label: "Awaiting receipt", states: ["ORDERED", "PARTIALLY_RECEIVED"] },
  { value: "received", label: "Received", states: ["RECEIVED"] },
  { value: "cancelled", label: "Cancelled", states: ["CANCELLED"] },
];

export default async function PurchaseOrdersPage() {
  await requireRole("STORE_KEEPER", "MANAGER");

  const [orders, openCount, receivedCount, spendAgg, openValueAgg] = await Promise.all([
    db.purchaseOrder.findMany({
      include: {
        supplier: { select: { name: true } },
        items: { select: { quantity: true, received: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.purchaseOrder.count({ where: { state: { in: ["ORDERED", "PARTIALLY_RECEIVED"] } } }),
    db.purchaseOrder.count({ where: { state: "RECEIVED" } }),
    db.purchaseOrder.aggregate({ _sum: { total: true }, where: { state: { not: "CANCELLED" } } }),
    db.purchaseOrder.aggregate({
      _sum: { total: true },
      where: { state: { in: ["ORDERED", "PARTIALLY_RECEIVED"] } },
    }),
  ]);

  const rows = orders.map((po) => {
    const ordered = po.items.reduce((s, i) => s + i.quantity, 0);
    const received = po.items.reduce((s, i) => s + i.received, 0);
    return {
      ...po,
      lines: po.items.length,
      ordered,
      received,
      pct: ordered > 0 ? Math.round((received / ordered) * 100) : 0,
    };
  });

  const counts: Record<string, number> = {
    all: rows.length,
    open: rows.filter((r) => r.state === "ORDERED" || r.state === "PARTIALLY_RECEIVED").length,
    received: rows.filter((r) => r.state === "RECEIVED").length,
    cancelled: rows.filter((r) => r.state === "CANCELLED").length,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Purchase orders"
        description="Raise orders to suppliers and record goods received."
        icon={ShoppingCart}
        actions={
          <>
            <Button variant="ghost" asChild>
              <Link href="/store">
                <ArrowLeft className="size-4" /> Store
              </Link>
            </Button>
            <Button asChild variant="primary">
              <Link href="/store/purchase-orders/new">New purchase order</Link>
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricTile label="Total orders" value={orders.length} icon={ClipboardList} tone="brand" />
        <MetricTile
          label="Awaiting receipt"
          value={openCount}
          icon={Hourglass}
          tone={openCount > 0 ? "warning" : "success"}
          hint={birr(openValueAgg._sum.total ?? 0)}
        />
        <MetricTile label="Fully received" value={receivedCount} icon={PackageCheck} tone="success" />
        <MetricTile label="Committed spend" value={birr(spendAgg._sum.total ?? 0)} icon={Coins} tone="gold" />
      </div>

      <Tabs defaultValue="all">
        <TabsList className="flex-wrap">
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
              <span className="ml-1 rounded-full bg-muted-foreground/15 px-1.5 text-xs tabular-nums">
                {counts[t.value] ?? 0}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {TABS.map((t) => {
          const filtered = t.states ? rows.filter((r) => t.states!.includes(r.state)) : rows;
          return (
            <TabsContent key={t.value} value={t.value}>
              <Card>
                <CardContent className="p-0">
                  {filtered.length === 0 ? (
                    <EmptyState
                      title="No purchase orders here"
                      description={
                        t.value === "all"
                          ? "Raise your first purchase order to start procurement."
                          : "Orders in this state will appear here."
                      }
                      icon={ShoppingCart}
                      className="m-5"
                      action={
                        t.value === "all" ? (
                          <Button asChild variant="primary">
                            <Link href="/store/purchase-orders/new">New purchase order</Link>
                          </Button>
                        ) : undefined
                      }
                    />
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="pl-5">PO No.</TableHead>
                          <TableHead>Supplier</TableHead>
                          <TableHead className="text-right">Lines</TableHead>
                          <TableHead className="w-44">Received</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                          <TableHead>Raised</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="pr-5" />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filtered.map((po) => (
                          <TableRow key={po.id}>
                            <TableCell className="pl-5">
                              <Link
                                href={`/store/purchase-orders/${po.id}`}
                                className="font-mono text-xs font-medium hover:text-primary"
                              >
                                {po.poNo}
                              </Link>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {po.supplier?.name ?? <span className="italic">No supplier</span>}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">{po.lines}</TableCell>
                            <TableCell>
                              {po.state === "CANCELLED" ? (
                                <span className="text-xs text-muted-foreground">—</span>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <ProgressBar
                                    value={po.received}
                                    max={po.ordered}
                                    tone={po.pct >= 100 ? "success" : po.pct > 0 ? "info" : "warning"}
                                    className="w-20"
                                  />
                                  <span className="text-xs tabular-nums text-muted-foreground">{po.pct}%</span>
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">{birr(po.total)}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {format(po.createdAt, "dd MMM yyyy")}
                            </TableCell>
                            <TableCell>
                              <StatusBadge state={po.state} />
                            </TableCell>
                            <TableCell className="pr-5 text-right">
                              <Button asChild variant="ghost" size="sm">
                                <Link href={`/store/purchase-orders/${po.id}`}>
                                  Open <ArrowRight className="size-4" />
                                </Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
