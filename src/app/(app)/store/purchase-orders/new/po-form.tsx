"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, ShoppingCart, Truck, ListChecks } from "lucide-react";
import { birr } from "@/lib/money";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createPurchaseOrderAction } from "../actions";

const selectCls =
  "flex h-10 w-full rounded-lg border border-input bg-card px-3 text-sm shadow-sm focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/40 outline-none";

export type SupplierOption = { id: string; name: string };
export type MedicationOption = { id: string; name: string; strength: string | null; form: string | null };

interface LineRow {
  itemName: string;
  quantity: number;
  unitPrice: number;
  medicationId: string;
}

function emptyRow(): LineRow {
  return { itemName: "", quantity: 1, unitPrice: 0, medicationId: "" };
}

export function PurchaseOrderForm({
  suppliers,
  medications,
}: {
  suppliers: SupplierOption[];
  medications: MedicationOption[];
}) {
  const router = useRouter();
  const [supplierId, setSupplierId] = React.useState("");
  const [note, setNote] = React.useState("");
  const [rows, setRows] = React.useState<LineRow[]>([emptyRow()]);
  const [error, setError] = React.useState<string>();
  const [pending, start] = React.useTransition();

  const update = (i: number, patch: Partial<LineRow>) =>
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));

  const total = rows.reduce((sum, r) => sum + r.quantity * (r.unitPrice || 0), 0);
  const validLines = rows.filter((r) => r.itemName.trim() && r.quantity > 0).length;
  const totalUnits = rows.reduce((sum, r) => sum + (r.itemName.trim() ? r.quantity : 0), 0);
  const supplierName = suppliers.find((s) => s.id === supplierId)?.name;

  function onMedicationChange(i: number, medicationId: string) {
    const med = medications.find((m) => m.id === medicationId);
    update(i, {
      medicationId,
      itemName: med
        ? [med.name, med.strength, med.form].filter(Boolean).join(" ")
        : rows[i].itemName,
    });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const items = rows
      .filter((r) => r.itemName.trim() && r.quantity > 0)
      .map((r) => ({
        itemName: r.itemName.trim(),
        quantity: r.quantity,
        unitPrice: r.unitPrice || 0,
        medicationId: r.medicationId || null,
      }));
    if (items.length === 0) {
      setError("Add at least one line item with a name and quantity.");
      return;
    }
    start(async () => {
      const res = await createPurchaseOrderAction({ supplierId: supplierId || null, note: note || null, items });
      if (res.ok && res.id) {
        toast.success("Purchase order created");
        router.push(`/store/purchase-orders/${res.id}`);
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="size-4 text-muted-foreground" /> Order details
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Supplier</Label>
              <select className={selectCls} value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
                <option value="">No supplier / to be decided</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="po-note">Note</Label>
              <Input id="po-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Internal reference / remarks" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ListChecks className="size-4 text-muted-foreground" /> Line items
            </CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={() => setRows((r) => [...r, emptyRow()])}>
              <Plus className="size-4" /> Add line
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[220px] pl-5">Item</TableHead>
                  <TableHead>Link medication</TableHead>
                  <TableHead className="w-24 text-right">Qty</TableHead>
                  <TableHead className="w-32 text-right">Unit price</TableHead>
                  <TableHead className="w-32 text-right">Line total</TableHead>
                  <TableHead className="w-12 pr-5" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row, i) => (
                  <TableRow key={i}>
                    <TableCell className="pl-5">
                      <Input
                        value={row.itemName}
                        onChange={(e) => update(i, { itemName: e.target.value })}
                        placeholder="e.g. Examination gloves (box)"
                      />
                    </TableCell>
                    <TableCell>
                      <select
                        className={selectCls}
                        value={row.medicationId}
                        onChange={(e) => onMedicationChange(i, e.target.value)}
                      >
                        <option value="">— none —</option>
                        {medications.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name} {m.strength ?? ""} {m.form ? `(${m.form})` : ""}
                          </option>
                        ))}
                      </select>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={1}
                        className="text-right"
                        value={row.quantity}
                        onChange={(e) => update(i, { quantity: Number(e.target.value) })}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        step="any"
                        className="text-right"
                        value={row.unitPrice}
                        onChange={(e) => update(i, { unitPrice: Number(e.target.value) })}
                      />
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {birr(row.quantity * (row.unitPrice || 0))}
                    </TableCell>
                    <TableCell className="pr-5 text-right">
                      {rows.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Remove line"
                          onClick={() => setRows((r) => r.filter((_, idx) => idx !== i))}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Order summary */}
      <div className="lg:col-span-1">
        <Card className="lg:sticky lg:top-6">
          <CardHeader>
            <CardTitle>Order summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <dl className="space-y-2.5 text-sm">
              <SummaryLine label="Supplier" value={supplierName ?? "To be decided"} />
              <SummaryLine label="Line items" value={String(validLines)} />
              <SummaryLine label="Total units" value={String(totalUnits)} />
            </dl>
            <Separator />
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-muted-foreground">Order total</span>
              <span className="text-2xl font-semibold tabular-nums tracking-tight text-foreground">{birr(total)}</span>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="space-y-2">
              <Button type="submit" variant="primary" disabled={pending || validLines === 0} className="w-full">
                {pending ? <Loader2 className="animate-spin" /> : <ShoppingCart className="size-4" />} Create order
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => router.push("/store/purchase-orders")}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="truncate text-right font-medium tabular-nums text-foreground">{value}</dd>
    </div>
  );
}
