import Link from "next/link";
import {
  Boxes,
  PackageCheck,
  ClipboardList,
  ShoppingCart,
  ArrowRight,
  Package,
  Truck,
  UserCheck,
} from "lucide-react";
import { requireRole } from "@/server/session";
import { db } from "@/server/db";
import { roleLabel } from "@/lib/rbac";
import { birr } from "@/lib/money";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";

export const metadata = { title: "Store & Assets" };

const QUICK_LINKS = [
  {
    href: "/store/assets",
    label: "Asset register",
    description: "Track, assign and return equipment.",
    icon: Package,
  },
  {
    href: "/store/requests",
    label: "Stock requests",
    description: "Review and fulfil department requests.",
    icon: ClipboardList,
  },
  {
    href: "/store/purchase-orders",
    label: "Purchase orders",
    description: "Raise POs and receive goods.",
    icon: ShoppingCart,
  },
];

export default async function StoreDashboardPage() {
  const actor = await requireRole("STORE_KEEPER", "MANAGER");

  const [
    totalAssets,
    assignedCount,
    pendingRequests,
    openPOs,
    poValueAgg,
    recentRequests,
    recentPOs,
    recentAssignments,
  ] = await Promise.all([
    db.asset.count(),
    db.assetAssignment.count({ where: { state: "ASSIGNED" } }),
    db.stockRequest.count({ where: { state: "SUBMITTED" } }),
    db.purchaseOrder.count({ where: { state: { in: ["ORDERED", "PARTIALLY_RECEIVED"] } } }),
    db.purchaseOrder.aggregate({
      _sum: { total: true },
      where: { state: { in: ["ORDERED", "PARTIALLY_RECEIVED"] } },
    }),
    db.stockRequest.findMany({
      include: { requester: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    db.purchaseOrder.findMany({
      include: { supplier: { select: { name: true } }, _count: { select: { items: true } } },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    db.assetAssignment.findMany({
      where: { state: "ASSIGNED" },
      include: { asset: { select: { name: true, tag: true } }, user: { select: { name: true } } },
      orderBy: { assignedAt: "desc" },
      take: 6,
    }),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Store & Assets"
        description={`Non-medical inventory, assets and procurement · ${roleLabel(actor.role)}`}
        icon={Boxes}
        actions={
          <>
            <Button asChild variant="outline">
              <Link href="/store/requests">Stock requests</Link>
            </Button>
            <Button asChild variant="primary">
              <Link href="/store/purchase-orders/new">New purchase order</Link>
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Registered assets" value={totalAssets} icon={Package} tone="brand" href="/store/assets" />
        <StatCard label="Currently assigned" value={assignedCount} icon={UserCheck} tone="info" href="/store/assets" />
        <StatCard
          label="Pending stock requests"
          value={pendingRequests}
          icon={ClipboardList}
          tone={pendingRequests > 0 ? "warning" : "success"}
          href="/store/requests"
        />
        <StatCard
          label="Open purchase orders"
          value={openPOs}
          icon={ShoppingCart}
          tone={openPOs > 0 ? "info" : "success"}
          hint={birr(poValueAgg._sum.total ?? 0)}
          href="/store/purchase-orders"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {QUICK_LINKS.map((q) => (
          <Link key={q.href} href={q.href} className="group block">
            <Card className="h-full p-5 transition-shadow hover:shadow-md">
              <div className="flex items-start justify-between">
                <span className="flex size-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                  <q.icon className="size-5" />
                </span>
                <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </div>
              <div className="mt-4">
                <p className="font-semibold text-foreground">{q.label}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{q.description}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Recent stock requests</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/store/requests">
                View all <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {recentRequests.length === 0 ? (
              <EmptyState title="No stock requests yet" description="Requests raised by departments appear here." className="m-5" icon={ClipboardList} />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Requested by</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentRequests.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.itemName}</TableCell>
                      <TableCell className="text-muted-foreground">{r.requester.name}</TableCell>
                      <TableCell className="text-right tabular-nums">{r.quantity}</TableCell>
                      <TableCell className="text-right">
                        <StatusBadge state={r.state} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Recent purchase orders</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/store/purchase-orders">
                View all <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {recentPOs.length === 0 ? (
              <EmptyState title="No purchase orders yet" description="Raise a PO to start procurement." className="m-5" icon={ShoppingCart} />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>PO No.</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentPOs.map((po) => (
                    <TableRow key={po.id}>
                      <TableCell>
                        <Link href={`/store/purchase-orders/${po.id}`} className="font-medium hover:text-primary">
                          {po.poNo}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {po.supplier?.name ?? <span className="italic">No supplier</span>}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{birr(po.total)}</TableCell>
                      <TableCell className="text-right">
                        <StatusBadge state={po.state} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Assets on loan</CardTitle>
          <Button asChild variant="ghost" size="sm">
            <Link href="/store/assets">
              Asset register <ArrowRight className="size-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {recentAssignments.length === 0 ? (
            <EmptyState
              title="Nothing on loan"
              description="Assets you assign to staff will be tracked here."
              className="m-5"
              icon={PackageCheck}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset</TableHead>
                  <TableHead>Tag</TableHead>
                  <TableHead>Holder</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Since</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentAssignments.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.asset.name}</TableCell>
                    <TableCell className="text-muted-foreground">{a.asset.tag}</TableCell>
                    <TableCell className="text-muted-foreground">{a.user.name}</TableCell>
                    <TableCell className="text-right tabular-nums">{a.quantity}</TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {a.assignedAt.toLocaleDateString()}
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
