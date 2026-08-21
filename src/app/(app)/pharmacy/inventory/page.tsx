import Link from "next/link";
import {
  Boxes,
  Search,
  Package,
  AlertTriangle,
  PackageX,
  CalendarClock,
  Wallet,
  ChevronRight,
  Truck,
  ArrowLeft,
} from "lucide-react";
import { requireRole } from "@/server/session";
import {
  listMedicationsWithStock,
  stockValuation,
  supplierOptions,
  type MedicationWithStock,
} from "@/server/services/inventory";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/empty-state";
import { cn, humanize } from "@/lib/utils";
import { AddMedicineDialog, ReceiveStockDialog } from "./inventory-dialogs";
import { expiryClass, formatDate, isExpiringSoon } from "./expiry";

export const metadata = { title: "Pharmacy inventory" };

const STATUS_BADGE = {
  out: { variant: "danger" as const, label: "Out of stock" },
  low: { variant: "warning" as const, label: "Low" },
  ok: { variant: "success" as const, label: "In stock" },
};

function MedTable({ rows }: { rows: MedicationWithStock[] }) {
  if (rows.length === 0) {
    return <EmptyState title="Nothing here" description="No medicines match this filter." icon={Package} className="m-5" />;
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Medicine</TableHead>
          <TableHead>Category</TableHead>
          <TableHead className="text-right">On hand</TableHead>
          <TableHead className="text-right">Reorder</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Soonest expiry</TableHead>
          <TableHead className="text-right">Sell (ETB)</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((m) => {
          const badge = STATUS_BADGE[m.status];
          return (
            <TableRow key={m.id} className="group">
              <TableCell>
                <Link href={`/pharmacy/inventory/${m.id}`} className="font-medium hover:text-primary">
                  {m.name} {m.strength ?? ""}
                </Link>
                <div className="text-xs text-muted-foreground">
                  {[humanize(m.form ?? ""), `${m.batchCount} batch${m.batchCount === 1 ? "" : "es"}`]
                    .filter(Boolean)
                    .join(" · ")}
                  {!m.isActive && <span className="ml-1 text-destructive">· inactive</span>}
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">{m.category ?? "—"}</TableCell>
              <TableCell className="text-right font-medium tabular-nums">
                {m.onHand}
                <span className="ml-1 text-xs font-normal text-muted-foreground">{m.unit}</span>
              </TableCell>
              <TableCell className="text-right tabular-nums text-muted-foreground">{m.reorderLevel}</TableCell>
              <TableCell>
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge variant={badge.variant}>{badge.label}</Badge>
                  {isExpiringSoon(m.soonestExpiry) && m.onHand > 0 && (
                    <Badge variant="warning" className="gap-1">
                      <CalendarClock className="size-3" /> Expiring
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className={cn("tabular-nums", expiryClass(m.soonestExpiry))}>
                {m.soonestExpiry ? formatDate(m.soonestExpiry) : "—"}
              </TableCell>
              <TableCell className="text-right tabular-nums">{m.sellPrice.toLocaleString()}</TableCell>
              <TableCell className="text-right">
                <Link
                  href={`/pharmacy/inventory/${m.id}`}
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

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tab?: string }>;
}) {
  await requireRole("PHARMACIST");
  const { q, tab } = await searchParams;
  const activeTab = ["all", "low", "out", "expiring"].includes(tab ?? "") ? (tab as string) : "all";

  const [meds, valuation, suppliers] = await Promise.all([
    listMedicationsWithStock(q),
    stockValuation(),
    supplierOptions(),
  ]);

  const low = meds.filter((m) => m.status === "low");
  const out = meds.filter((m) => m.status === "out");
  const expiring = meds.filter((m) => isExpiringSoon(m.soonestExpiry));

  const medOptions = meds
    .filter((m) => m.isActive)
    .map((m) => ({ id: m.id, label: `${m.name}${m.strength ? " " + m.strength : ""}${m.form ? " (" + m.form + ")" : ""}` }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory"
        description="Stock levels, batches, valuation and expiry across the medicine store."
        icon={Boxes}
        actions={
          <>
            <Button variant="ghost" asChild>
              <Link href="/pharmacy">
                <ArrowLeft className="size-4" /> Station
              </Link>
            </Button>
            <Button variant="default" asChild>
              <Link href="/pharmacy/suppliers">
                <Truck className="size-4" /> Suppliers
              </Link>
            </Button>
            <ReceiveStockDialog meds={medOptions} suppliers={suppliers} />
            <AddMedicineDialog />
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Medicines" value={meds.length} icon={Package} tone="brand" />
        <StatCard
          label="Stock value (ETB)"
          value={valuation.sell.toLocaleString()}
          hint={`Cost ${valuation.cost.toLocaleString()} · ${valuation.units.toLocaleString()} units`}
          icon={Wallet}
          tone="info"
        />
        <StatCard label="Low stock" value={low.length} icon={AlertTriangle} tone={low.length ? "warning" : "success"} />
        <StatCard label="Out of stock" value={out.length} icon={PackageX} tone={out.length ? "danger" : "success"} />
        <StatCard
          label="Expiring ≤60d"
          value={expiring.length}
          icon={CalendarClock}
          tone={expiring.length ? "warning" : "success"}
        />
      </div>

      <form className="flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input name="q" defaultValue={q} placeholder="Search medicines by name, category, strength…" className="pl-9" />
        </div>
        <Button type="submit">Search</Button>
      </form>

      <Tabs defaultValue={activeTab}>
        <TabsList>
          <TabsTrigger value="all">All ({meds.length})</TabsTrigger>
          <TabsTrigger value="low">Low ({low.length})</TabsTrigger>
          <TabsTrigger value="out">Out ({out.length})</TabsTrigger>
          <TabsTrigger value="expiring">Expiring ({expiring.length})</TabsTrigger>
        </TabsList>
        <Card className="mt-4">
          <CardContent className="p-0">
            <TabsContent value="all" className="m-0">
              {meds.length === 0 ? (
                <EmptyState
                  title={q ? "No matching medicines" : "No medicines yet"}
                  description={q ? "Try a different search." : "Add your first medicine to start tracking stock."}
                  icon={Package}
                  className="m-5"
                  action={q ? undefined : <AddMedicineDialog />}
                />
              ) : (
                <MedTable rows={meds} />
              )}
            </TabsContent>
            <TabsContent value="low" className="m-0">
              <MedTable rows={low} />
            </TabsContent>
            <TabsContent value="out" className="m-0">
              <MedTable rows={out} />
            </TabsContent>
            <TabsContent value="expiring" className="m-0">
              <MedTable rows={expiring} />
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}
