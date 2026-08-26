import Link from "next/link";
import { format } from "date-fns";
import {
  Boxes,
  PackageCheck,
  ClipboardList,
  ShoppingCart,
  ArrowRight,
  Package,
  UserCheck,
  Coins,
  TriangleAlert,
  Wallet,
  Truck,
  Activity,
} from "lucide-react";
import { requireRole } from "@/server/session";
import { db } from "@/server/db";
import { roleLabel } from "@/lib/rbac";
import { birr } from "@/lib/money";
import { MetricTile } from "@/components/dashboard/metric-tile";
import { Panel } from "@/components/dashboard/panel";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { ProgressBar } from "@/components/store/progress-bar";
import { StoreTimeline } from "@/components/store/store-timeline";

export const metadata = { title: "Store & Assets" };

/** Assets whose available (un-issued) quantity has run this low are flagged. */
const LOW_AVAILABILITY = 2;

const QUICK_LINKS = [
  {
    href: "/store/assets",
    label: "Asset register",
    description: "Track, assign and return equipment across the clinic.",
    icon: Package,
  },
  {
    href: "/store/requests",
    label: "Stock requests",
    description: "Review, approve and fulfil department requests.",
    icon: ClipboardList,
  },
  {
    href: "/store/purchase-orders",
    label: "Purchase orders",
    description: "Raise orders to suppliers and receive goods.",
    icon: ShoppingCart,
  },
];

export default async function StoreDashboardPage() {
  const actor = await requireRole("STORE_KEEPER", "MANAGER");

  const [
    assets,
    pendingRequests,
    approvedRequests,
    openPOs,
    poValueAgg,
    committedAgg,
    recentRequests,
    recentPOs,
    recentAssignments,
    activity,
  ] = await Promise.all([
    db.asset.findMany({
      select: {
        quantity: true,
        unitPrice: true,
        assignments: { where: { state: "ASSIGNED" }, select: { quantity: true } },
      },
    }),
    db.stockRequest.count({ where: { state: "SUBMITTED" } }),
    db.stockRequest.count({ where: { state: "APPROVED" } }),
    db.purchaseOrder.count({ where: { state: { in: ["ORDERED", "PARTIALLY_RECEIVED"] } } }),
    db.purchaseOrder.aggregate({
      _sum: { total: true },
      where: { state: { in: ["ORDERED", "PARTIALLY_RECEIVED"] } },
    }),
    db.purchaseOrder.aggregate({ _sum: { total: true }, where: { state: { not: "CANCELLED" } } }),
    db.stockRequest.findMany({
      include: { requester: { select: { name: true, role: true } } },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    db.purchaseOrder.findMany({
      include: { supplier: { select: { name: true } }, items: { select: { quantity: true, received: true } } },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    db.assetAssignment.findMany({
      where: { state: "ASSIGNED" },
      include: { asset: { select: { name: true, tag: true } }, user: { select: { name: true } } },
      orderBy: { assignedAt: "desc" },
      take: 6,
    }),
    db.stateTransition.findMany({
      where: { entityType: { in: ["PurchaseOrder", "StockRequest", "AssetAssignment"] } },
      include: { actor: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  // ── Derived asset KPIs ──────────────────────────────────────────────────────
  const totalAssets = assets.length;
  const totalUnits = assets.reduce((s, a) => s + a.quantity, 0);
  const stockValue = assets.reduce((s, a) => s + a.quantity * a.unitPrice, 0);
  const assignedUnits = assets.reduce(
    (s, a) => s + a.assignments.reduce((q, x) => q + x.quantity, 0),
    0,
  );
  const lowAvailability = assets.filter(
    (a) => a.quantity - a.assignments.reduce((q, x) => q + x.quantity, 0) <= LOW_AVAILABILITY,
  ).length;

  const openPOValue = poValueAgg._sum.total ?? 0;
  const committedSpend = committedAgg._sum.total ?? 0;

  const timeline = activity.map((t) => ({
    id: t.id,
    entityType: t.entityType,
    event: t.event,
    fromState: t.fromState,
    toState: t.toState,
    note: t.note,
    createdAt: t.createdAt,
    actorName: t.actor?.name,
    href:
      t.entityType === "PurchaseOrder"
        ? `/store/purchase-orders/${t.entityId}`
        : t.entityType === "StockRequest"
          ? "/store/requests"
          : undefined,
  }));

  return (
    <div className="space-y-6">
      {/* ── Hero band ───────────────────────────────────────────────────────── */}
      <section className="bg-brand-gradient relative overflow-hidden rounded-2xl px-6 py-7 text-white sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute -right-16 -top-24 size-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 right-1/3 size-64 rounded-full bg-gold/20 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs font-medium text-white/70">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 ring-1 ring-white/15">
                <Boxes className="size-3.5" />
                {roleLabel(actor.role)}
              </span>
              <span className="hidden sm:inline">Inventory · Assets · Procurement</span>
            </div>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-balance sm:text-[28px]">
              Store operations
            </h1>
            <p className="mt-1.5 max-w-md text-sm text-white/70">
              Non-medical inventory, equipment lifecycle and supplier procurement in one place.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                href="/store/requests"
                className="inline-flex h-9 items-center gap-2 rounded-lg bg-white/10 px-4 text-sm font-medium text-white ring-1 ring-white/20 transition-colors hover:bg-white/20"
              >
                <ClipboardList className="size-4" /> Stock requests
              </Link>
              <Link
                href="/store/purchase-orders/new"
                className="inline-flex h-9 items-center gap-2 rounded-lg bg-white px-4 text-sm font-medium text-brand-700 shadow-sm transition-colors hover:bg-white/90"
              >
                <ShoppingCart className="size-4" /> New purchase order
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:max-w-md lg:w-auto">
            <HeroStat icon={Wallet} label="Stock value" value={birr(stockValue)} />
            <HeroStat icon={Truck} label="Open PO value" value={birr(openPOValue)} />
            <HeroStat icon={Package} label="Units tracked" value={totalUnits.toLocaleString()} />
          </div>
        </div>
      </section>

      {/* ── KPI strip ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <MetricTile label="Registered assets" value={totalAssets} icon={Package} tone="brand" href="/store/assets" />
        <MetricTile label="Units on loan" value={assignedUnits} icon={UserCheck} tone="info" href="/store/assets" />
        <MetricTile
          label="Low availability"
          value={lowAvailability}
          icon={TriangleAlert}
          tone={lowAvailability > 0 ? "warning" : "success"}
          hint="≤ 2 units free"
          href="/store/assets"
        />
        <MetricTile
          label="Pending requests"
          value={pendingRequests}
          icon={ClipboardList}
          tone={pendingRequests > 0 ? "warning" : "success"}
          hint={approvedRequests > 0 ? `${approvedRequests} to fulfil` : undefined}
          href="/store/requests"
        />
        <MetricTile
          label="Open purchase orders"
          value={openPOs}
          icon={ShoppingCart}
          tone={openPOs > 0 ? "info" : "success"}
          hint={birr(openPOValue)}
          href="/store/purchase-orders"
        />
        <MetricTile
          label="Committed spend"
          value={birr(committedSpend)}
          icon={Coins}
          tone="gold"
          href="/store/purchase-orders"
        />
      </div>

      {/* ── Procurement + activity bento ────────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel
          title="Recent purchase orders"
          description="Latest orders and their receipt progress"
          icon={ShoppingCart}
          action={{ label: "All orders", href: "/store/purchase-orders" }}
          className="lg:col-span-2"
          bodyClassName="p-0"
        >
          {recentPOs.length === 0 ? (
            <EmptyState
              title="No purchase orders yet"
              description="Raise a PO to start procurement."
              className="m-5"
              icon={ShoppingCart}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-5">PO No.</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead className="w-40">Received</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="pr-5 text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentPOs.map((po) => {
                  const ordered = po.items.reduce((s, i) => s + i.quantity, 0);
                  const received = po.items.reduce((s, i) => s + i.received, 0);
                  const pct = ordered > 0 ? Math.round((received / ordered) * 100) : 0;
                  return (
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
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <ProgressBar
                            value={received}
                            max={ordered}
                            tone={pct >= 100 ? "success" : pct > 0 ? "info" : "warning"}
                            className="w-20"
                          />
                          <span className="text-xs tabular-nums text-muted-foreground">{pct}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{birr(po.total)}</TableCell>
                      <TableCell className="pr-5 text-right">
                        <StatusBadge state={po.state} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </Panel>

        <Panel title="Store activity" description="Latest movements across the store" icon={Activity}>
          <StoreTimeline entries={timeline} />
        </Panel>
      </div>

      {/* ── Requests + assets on loan ───────────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel
          title="Recent stock requests"
          description="Consumables requested by departments"
          icon={ClipboardList}
          action={{ label: "All requests", href: "/store/requests" }}
          className="lg:col-span-2"
          bodyClassName="p-0"
        >
          {recentRequests.length === 0 ? (
            <EmptyState
              title="No stock requests yet"
              description="Requests raised by departments appear here."
              className="m-5"
              icon={ClipboardList}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-5">Item</TableHead>
                  <TableHead>Requested by</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="pr-5 text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentRequests.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="pl-5 font-medium">{r.itemName}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {r.requester.name}
                      <span className="block text-xs">{r.requester.role}</span>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{r.quantity}</TableCell>
                    <TableCell className="pr-5 text-right">
                      <StatusBadge state={r.state} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Panel>

        <Panel
          title="Assets on loan"
          description={`${assignedUnits} unit(s) currently issued`}
          icon={PackageCheck}
          action={{ label: "Register", href: "/store/assets" }}
        >
          {recentAssignments.length === 0 ? (
            <EmptyState
              title="Nothing on loan"
              description="Assets you assign to staff are tracked here."
              className="m-1"
              icon={PackageCheck}
            />
          ) : (
            <ul className="divide-y divide-border/70">
              {recentAssignments.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{a.asset.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {a.user.name} · {a.asset.tag}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold tabular-nums text-foreground">×{a.quantity}</p>
                    <p className="text-xs text-muted-foreground">{format(a.assignedAt, "dd MMM")}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      {/* ── Quick links ─────────────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-3">
        {QUICK_LINKS.map((q) => (
          <Link key={q.href} href={q.href} className="group block">
            <div className="flex h-full flex-col rounded-2xl border border-border bg-card p-5 shadow-[0_1px_2px_rgba(14,26,47,0.05)] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_1px_2px_rgba(14,26,47,0.05),0_14px_30px_-18px_rgba(14,26,47,0.4)]">
              <div className="flex items-start justify-between">
                <span className="flex size-11 items-center justify-center rounded-xl bg-accent text-accent-foreground transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105">
                  <q.icon className="size-5" />
                </span>
                <ArrowRight className="size-4 text-muted-foreground transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5" />
              </div>
              <div className="mt-4">
                <p className="font-semibold text-foreground">{q.label}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{q.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ── Colocated presentational helpers (server) ───────────────────────────── */

function HeroStat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-white/10 p-3 ring-1 ring-white/15 backdrop-blur-sm">
      <Icon className="size-4 text-white/60" />
      <div className="mt-2 truncate text-lg font-semibold tabular-nums leading-none">{value}</div>
      <div className="mt-1 text-[11px] font-medium text-white/60">{label}</div>
    </div>
  );
}
