"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Loader2,
  PackageCheck,
  XCircle,
  Minus,
  Plus,
  Layers,
  AlertTriangle,
  Receipt,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { cn } from "@/lib/utils";
import { dispenseAction, cancelOrderAction } from "./actions";

interface Batch {
  batchNo: string;
  expiryDate: string;
  quantity: number;
  sellPrice: number;
}

interface Item {
  id: string;
  state: string;
  quantity: number;
  dispensedQty: number;
  dose: string | null;
  frequency: string | null;
  duration: string | null;
  instructions: string | null;
  unit: string;
  stock: number;
  medication: { name: string; strength: string | null; form: string | null };
  batches: Batch[];
}

const birr = (n: number) => `Br ${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;

/** FEFO allocation preview: walk batches earliest-expiry-first for `qty` units. */
function allocate(batches: Batch[], qty: number) {
  const picks: { batchNo: string; expiryDate: string; take: number; value: number }[] = [];
  let remaining = qty;
  let value = 0;
  for (const b of batches) {
    if (remaining <= 0) break;
    const take = Math.min(b.quantity, remaining);
    picks.push({ batchNo: b.batchNo, expiryDate: b.expiryDate, take, value: take * b.sellPrice });
    value += take * b.sellPrice;
    remaining -= take;
  }
  return { picks, value, shortfall: Math.max(0, remaining) };
}

export function DispenseClient({
  orderId,
  items,
  canDispense,
}: {
  orderId: string;
  items: Item[];
  canDispense: boolean;
}) {
  const router = useRouter();
  const [pending, start] = React.useTransition();
  const [qty, setQty] = React.useState<Record<string, number>>(
    Object.fromEntries(items.map((i) => [i.id, Math.min(Math.max(0, i.quantity - i.dispensedQty), i.stock)])),
  );

  const setLine = (id: string, value: number, max: number) =>
    setQty((s) => ({ ...s, [id]: Math.max(0, Math.min(max, Math.floor(value) || 0)) }));

  const fillAll = () =>
    setQty(
      Object.fromEntries(
        items.map((i) => [i.id, Math.min(Math.max(0, i.quantity - i.dispensedQty), i.stock)]),
      ),
    );
  const clearAll = () => setQty(Object.fromEntries(items.map((i) => [i.id, 0])));

  // ── Running totals / stock impact ─────────────────────────────────────────
  const summary = items.reduce(
    (acc, i) => {
      const n = qty[i.id] ?? 0;
      if (n > 0) {
        acc.units += n;
        acc.value += allocate(i.batches, n).value;
        acc.lines += 1;
      }
      return acc;
    },
    { units: 0, value: 0, lines: 0 },
  );

  const dispense = () =>
    start(async () => {
      const dispenses = items
        .map((i) => ({ itemId: i.id, quantity: qty[i.id] ?? 0 }))
        .filter((d) => d.quantity > 0);
      if (dispenses.length === 0) {
        toast.error("Enter quantities to dispense");
        return;
      }
      const r = await dispenseAction(orderId, dispenses);
      if (r.ok) {
        toast.success("Dispensed");
        router.refresh();
      } else toast.error(r.error ?? "Failed");
    });

  const cancel = () =>
    start(async () => {
      const r = await cancelOrderAction(orderId, "Cancelled by pharmacy");
      if (r.ok) {
        toast.success("Order cancelled");
        router.refresh();
      } else toast.error(r.error ?? "Failed");
    });

  return (
    <div>
      {canDispense && (
        <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-2.5">
          <span className="text-xs text-muted-foreground">
            Batches auto-selected first-expiry-first (FEFO)
          </span>
          <div className="flex gap-1.5">
            <Button variant="ghost" size="sm" onClick={fillAll} disabled={pending}>
              Fill outstanding
            </Button>
            <Button variant="ghost" size="sm" onClick={clearAll} disabled={pending}>
              Clear
            </Button>
          </div>
        </div>
      )}

      <div className="divide-y divide-border">
        {items.map((it) => {
          const outstanding = it.quantity - it.dispensedQty;
          const n = qty[it.id] ?? 0;
          const { picks, value, shortfall } = allocate(it.batches, n);
          const lineDone = it.dispensedQty >= it.quantity;
          const active = canDispense && outstanding > 0;
          const sig = [it.dose, it.frequency, it.duration].filter(Boolean).join(" · ");
          return (
            <div key={it.id} className="flex flex-wrap items-start gap-4 p-4">
              {/* Drug + sig */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">
                    {it.medication.name} {it.medication.strength}
                  </span>
                  {it.medication.form && (
                    <span className="text-xs text-muted-foreground">{it.medication.form}</span>
                  )}
                  {(lineDone || !active) && <StatusBadge state={it.state} />}
                </div>
                {sig && <div className="mt-0.5 text-xs text-muted-foreground">{sig}</div>}
                {it.instructions && (
                  <div className="mt-0.5 text-xs italic text-muted-foreground">“{it.instructions}”</div>
                )}
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                  <span className="text-muted-foreground">
                    Rx <span className="font-medium tabular-nums text-foreground">{it.quantity}</span>
                  </span>
                  <span className="text-muted-foreground">
                    Dispensed{" "}
                    <span className="font-medium tabular-nums text-foreground">{it.dispensedQty}</span>
                  </span>
                  <span className="text-muted-foreground">
                    Outstanding{" "}
                    <span className="font-medium tabular-nums text-foreground">{outstanding}</span>
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium tabular-nums",
                      it.stock <= 0
                        ? "bg-destructive/15 text-destructive"
                        : it.stock < outstanding
                          ? "bg-warning/15 text-warning"
                          : "bg-muted text-muted-foreground",
                    )}
                  >
                    <Layers className="size-3" /> {it.stock} {it.unit} in stock
                  </span>
                </div>

                {/* FEFO batch pick preview */}
                {active && n > 0 && (
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    {picks.map((p) => (
                      <span
                        key={p.batchNo}
                        className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/60 px-2 py-0.5 text-[11px]"
                      >
                        <span className="font-mono">{p.batchNo}</span>
                        <span className="text-muted-foreground">exp {format(new Date(p.expiryDate), "MMM yyyy")}</span>
                        <span className="font-medium tabular-nums">×{p.take}</span>
                      </span>
                    ))}
                    {shortfall > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-destructive/15 px-2 py-0.5 text-[11px] font-medium text-destructive">
                        <AlertTriangle className="size-3" /> {shortfall} short of stock
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Stepper + line value */}
              {active ? (
                <div className="flex flex-col items-end gap-1.5">
                  <div className="flex items-center rounded-lg border border-border">
                    <button
                      type="button"
                      aria-label="Decrease"
                      onClick={() => setLine(it.id, n - 1, outstanding)}
                      disabled={pending || n <= 0}
                      className="flex size-9 items-center justify-center rounded-l-lg text-muted-foreground transition-colors hover:bg-muted disabled:opacity-40"
                    >
                      <Minus className="size-4" />
                    </button>
                    <input
                      type="number"
                      min={0}
                      max={outstanding}
                      value={n}
                      onChange={(e) => setLine(it.id, Number(e.target.value), outstanding)}
                      className="h-9 w-14 border-x border-border bg-transparent text-center text-sm font-medium tabular-nums outline-none focus:bg-muted/50"
                    />
                    <button
                      type="button"
                      aria-label="Increase"
                      onClick={() => setLine(it.id, n + 1, outstanding)}
                      disabled={pending || n >= outstanding}
                      className="flex size-9 items-center justify-center rounded-r-lg text-muted-foreground transition-colors hover:bg-muted disabled:opacity-40"
                    >
                      <Plus className="size-4" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLine(it.id, outstanding, outstanding)}
                    disabled={pending || n >= outstanding}
                    className="text-[11px] font-medium text-primary hover:underline disabled:opacity-40"
                  >
                    Max {outstanding}
                  </button>
                  {value > 0 && (
                    <span className="text-xs tabular-nums text-muted-foreground">{birr(value)}</span>
                  )}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* ── Register footer: running totals + actions ───────────────── */}
      {canDispense && (
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border bg-muted/30 p-4">
          <div className="flex items-center gap-5">
            <div>
              <div className="text-lg font-semibold tabular-nums leading-none">{summary.units}</div>
              <div className="mt-1 text-xs text-muted-foreground">Units</div>
            </div>
            <div>
              <div className="text-lg font-semibold tabular-nums leading-none">{summary.lines}</div>
              <div className="mt-1 text-xs text-muted-foreground">Lines</div>
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 text-lg font-semibold tabular-nums leading-none">
                <Receipt className="size-4 text-muted-foreground" /> {birr(summary.value)}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">Est. value</div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={cancel} disabled={pending} className="text-destructive">
              <XCircle className="size-4" /> Cancel order
            </Button>
            <Button variant="primary" size="lg" onClick={dispense} disabled={pending || summary.units === 0}>
              {pending ? <Loader2 className="animate-spin" /> : <PackageCheck className="size-4" />}
              Dispense {summary.units > 0 ? `${summary.units} unit${summary.units === 1 ? "" : "s"}` : ""}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
