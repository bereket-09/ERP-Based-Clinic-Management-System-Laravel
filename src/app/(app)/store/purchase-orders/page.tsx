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
import { requireRole } from "@/server/session";
import { db } from "@/server/db";
import { birr } from "@/lib/money";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";

export const metadata = { title: "Purchase orders" };

export default async function PurchaseOrdersPage() {
  await requireRole("STORE_KEEPER", "MANAGER");

  const [orders, openCount, receivedCount, spendAgg, openValueAgg] = await Promise.all([
    db.purchaseOrder.findMany({
      include: {
        supplier: { select: { name: true } },
        _count: { select: { items: true } },
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
        <StatCard label="Total orders" value={orders.length} icon={ClipboardList} tone="brand" />
        <StatCard label="Awaiting receipt" value={openCount} icon={Hourglass} tone={openCount > 0 ? "warning" : "success"} hint={birr(openValueAgg._sum.total ?? 0)} />
        <StatCard label="Fully received" value={receivedCount} icon={PackageCheck} tone="success" />
        <StatCard label="Committed spend" value={birr(spendAgg._sum.total ?? 0)} icon={Coins} tone="info" />
      </div>

      <Card>
        <CardContent className="p-0">
          {orders.length === 0 ? (
            <EmptyState
              title="No purchase orders yet"
              description="Raise your first purchase order to start procurement."
              icon={ShoppingCart}
              className="m-5"
              action={
                <Button asChild variant="primary">
                  <Link href="/store/purchase-orders/new">New purchase order</Link>
                </Button>
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PO No.</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead className="text-right">Lines</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Raised</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((po) => (
                  <TableRow key={po.id}>
                    <TableCell className="font-mono text-xs">
                      <Link href={`/store/purchase-orders/${po.id}`} className="font-medium hover:text-primary">
                        {po.poNo}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {po.supplier?.name ?? <span className="italic">No supplier</span>}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{po._count.items}</TableCell>
                    <TableCell className="text-right tabular-nums">{birr(po.total)}</TableCell>
                    <TableCell className="text-muted-foreground">{format(po.createdAt, "dd MMM yyyy")}</TableCell>
                    <TableCell>
                      <StatusBadge state={po.state} />
                    </TableCell>
                    <TableCell className="text-right">
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
    </div>
  );
}
