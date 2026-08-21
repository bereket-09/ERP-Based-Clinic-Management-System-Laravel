import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, Boxes, Layers, History, Wallet, TrendingUp, Package } from "lucide-react";
import { requireRole } from "@/server/session";
import { medicationDetail, supplierOptions } from "@/server/services/inventory";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { cn, humanize } from "@/lib/utils";
import { ReceiveStockDialog } from "../inventory-dialogs";
import { expiryClass, expiryLabel, formatDate } from "../expiry";
import { AdjustStockDialog, ToggleActiveButton, type BatchOption } from "./detail-client";

export const metadata = { title: "Medicine detail" };

const STATUS_BADGE = {
  out: { variant: "danger" as const, label: "Out of stock" },
  low: { variant: "warning" as const, label: "Low stock" },
  ok: { variant: "success" as const, label: "In stock" },
};

export default async function MedicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("PHARMACIST");
  const { id } = await params;

  const [med, suppliers] = await Promise.all([medicationDetail(id), supplierOptions()]);
  if (!med) notFound();

  const badge = STATUS_BADGE[med.status];
  const batchOptions: BatchOption[] = med.batches
    .filter((b) => b.quantity > 0)
    .map((b) => ({ id: b.id, label: `${b.batchNo} (exp ${formatDate(b.expiryDate)})`, onHand: b.quantity }));

  const subtitle = [med.strength, humanize(med.form ?? ""), med.category].filter(Boolean).join(" · ");

  return (
    <div className="space-y-6">
      <PageHeader
        title={med.name}
        description={subtitle || "Medicine detail"}
        icon={Boxes}
        actions={
          <>
            <Button variant="ghost" asChild>
              <Link href="/pharmacy/inventory">
                <ArrowLeft className="size-4" /> Back
              </Link>
            </Button>
            <ToggleActiveButton id={med.id} isActive={med.isActive} />
            <AdjustStockDialog batches={batchOptions} />
            <ReceiveStockDialog suppliers={suppliers} fixedMedicationId={med.id} />
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={badge.variant}>{badge.label}</Badge>
        {!med.isActive && <Badge variant="danger">Inactive</Badge>}
        <span className="text-sm text-muted-foreground">
          Reorder level {med.reorderLevel} {med.unit}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label={`On hand (${med.unit})`} value={med.onHand} icon={Package} tone="brand" />
        <StatCard label="Batches" value={med.batches.length} icon={Layers} tone="info" />
        <StatCard label="Stock value (sell)" value={med.stockValueSell.toLocaleString()} icon={Wallet} tone="success" />
        <StatCard
          label="Stock value (cost)"
          value={med.stockValueCost.toLocaleString()}
          hint={`Margin ${(med.stockValueSell - med.stockValueCost).toLocaleString()} ETB`}
          icon={TrendingUp}
          tone="warning"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Layers className="size-4" /> Batches
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {med.batches.length === 0 ? (
            <EmptyState
              title="No batches yet"
              description="Receive stock to create the first batch."
              icon={Layers}
              className="m-5"
              action={<ReceiveStockDialog suppliers={suppliers} fixedMedicationId={med.id} />}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Batch #</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                  <TableHead className="text-right">Sell</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Received</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {med.batches.map((b) => (
                  <TableRow key={b.id} className={b.quantity === 0 ? "opacity-60" : undefined}>
                    <TableCell className="font-mono text-xs">{b.batchNo}</TableCell>
                    <TableCell className={cn("tabular-nums", expiryClass(b.expiryDate))}>
                      {formatDate(b.expiryDate)}
                      <span className="ml-1 text-xs font-normal opacity-80">({expiryLabel(b.expiryDate)})</span>
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">{b.quantity}</TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {b.costPrice.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{b.sellPrice.toLocaleString()}</TableCell>
                    <TableCell className="text-muted-foreground">{b.supplier?.name ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{format(b.receivedAt, "dd MMM yyyy")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <History className="size-4" /> Stock movements
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {med.movements.length === 0 ? (
            <EmptyState title="No movements yet" icon={History} className="m-5" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>When</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Change</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {med.movements.map((mv) => (
                  <TableRow key={mv.id}>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {format(mv.createdAt, "dd MMM yyyy HH:mm")}
                    </TableCell>
                    <TableCell>
                      <StatusBadge state={mv.type} label={humanize(mv.type)} />
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right font-medium tabular-nums",
                        mv.quantity >= 0 ? "text-success" : "text-destructive",
                      )}
                    >
                      {mv.quantity >= 0 ? `+${mv.quantity}` : mv.quantity}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{mv.batch.batchNo}</TableCell>
                    <TableCell className="text-muted-foreground">{mv.reason ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{mv.byUser?.name ?? "System"}</TableCell>
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
