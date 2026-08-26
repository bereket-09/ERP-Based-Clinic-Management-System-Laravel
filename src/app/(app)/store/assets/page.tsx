import Link from "next/link";
import { Package, Search, ArrowLeft, ArrowRight, UserCheck, Wallet, TriangleAlert } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { requireRole } from "@/server/session";
import { db } from "@/server/db";
import { birr } from "@/lib/money";
import { PageHeader } from "@/components/page-header";
import { MetricTile } from "@/components/dashboard/metric-tile";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/empty-state";
import { ProgressBar } from "@/components/store/progress-bar";
import { AddAssetButton } from "./assets-client";

export const metadata = { title: "Asset register" };

const LOW_AVAILABILITY = 2;

export default async function AssetsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireRole("STORE_KEEPER", "MANAGER");
  const { q } = await searchParams;

  const where: Prisma.AssetWhereInput = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { tag: { contains: q, mode: "insensitive" } },
          { category: { contains: q, mode: "insensitive" } },
          { serialNo: { contains: q, mode: "insensitive" } },
        ],
      }
    : {};

  const assets = await db.asset.findMany({
    where,
    include: {
      assignments: {
        where: { state: "ASSIGNED" },
        select: { quantity: true, user: { select: { name: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const rows = assets.map((a) => {
    const assignedQty = a.assignments.reduce((s, x) => s + x.quantity, 0);
    const available = a.quantity - assignedQty;
    const holders = a.assignments.length;
    const status =
      a.quantity === 0
        ? { label: "Empty", variant: "danger" as const }
        : available <= 0
          ? { label: "Fully deployed", variant: "info" as const }
          : available <= LOW_AVAILABILITY
            ? { label: "Low", variant: "warning" as const }
            : { label: "In stock", variant: "success" as const };
    return { ...a, assignedQty, available, holders, status };
  });

  // Portfolio KPIs (respect the current search scope).
  const totalUnits = rows.reduce((s, a) => s + a.quantity, 0);
  const totalValue = rows.reduce((s, a) => s + a.quantity * a.unitPrice, 0);
  const onLoan = rows.reduce((s, a) => s + a.assignedQty, 0);
  const lowCount = rows.filter((a) => a.available <= LOW_AVAILABILITY).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Asset register"
        description="Every tracked piece of equipment, its value and its current holders."
        icon={Package}
        actions={
          <>
            <Button variant="ghost" asChild>
              <Link href="/store">
                <ArrowLeft className="size-4" /> Store
              </Link>
            </Button>
            <AddAssetButton />
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricTile label="Registered assets" value={rows.length} icon={Package} tone="brand" hint={`${totalUnits} units`} />
        <MetricTile label="Portfolio value" value={birr(totalValue)} icon={Wallet} tone="gold" />
        <MetricTile label="Units on loan" value={onLoan} icon={UserCheck} tone="info" />
        <MetricTile
          label="Low availability"
          value={lowCount}
          icon={TriangleAlert}
          tone={lowCount > 0 ? "warning" : "success"}
          hint="≤ 2 units free"
        />
      </div>

      <form className="flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input name="q" defaultValue={q} placeholder="Search by name, tag, serial or category…" className="pl-9" />
        </div>
        <Button type="submit">Search</Button>
        {q && (
          <Button variant="ghost" asChild>
            <Link href="/store/assets">Clear</Link>
          </Button>
        )}
      </form>

      <Card>
        <CardContent className="p-0">
          {rows.length === 0 ? (
            <EmptyState
              title={q ? "No matching assets" : "No assets yet"}
              description={q ? "Try a different search term." : "Register your first asset to start tracking it."}
              icon={Package}
              className="m-5"
              action={q ? undefined : <AddAssetButton />}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-5">Asset</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-44">Availability</TableHead>
                  <TableHead>Assigned to</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead className="pr-5" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((a) => {
                  const firstHolder = a.assignments[0]?.user?.name;
                  return (
                    <TableRow key={a.id}>
                      <TableCell className="pl-5">
                        <Link href={`/store/assets/${a.id}`} className="font-medium hover:text-primary">
                          {a.name}
                        </Link>
                        <span className="block font-mono text-xs text-muted-foreground">
                          {a.tag}
                          {a.serialNo ? ` · SN ${a.serialNo}` : ""}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{a.category ?? "—"}</TableCell>
                      <TableCell>
                        <Badge variant={a.status.variant}>{a.status.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <ProgressBar
                            value={a.available}
                            max={a.quantity}
                            tone={a.available <= LOW_AVAILABILITY ? "warning" : "success"}
                            className="w-20"
                          />
                          <span className="text-xs tabular-nums text-muted-foreground">
                            {a.available}/{a.quantity}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {a.holders === 0 ? (
                          <span className="text-muted-foreground/70">—</span>
                        ) : a.holders === 1 ? (
                          firstHolder
                        ) : (
                          <span>
                            {firstHolder}
                            <span className="text-muted-foreground/70"> +{a.holders - 1}</span>
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{birr(a.quantity * a.unitPrice)}</TableCell>
                      <TableCell className="pr-5 text-right">
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/store/assets/${a.id}`}>
                            Manage <ArrowRight className="size-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
