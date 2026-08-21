"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, PackageCheck, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/status-badge";
import { dispenseAction, cancelOrderAction } from "./actions";

interface Item {
  id: string;
  state: string;
  quantity: number;
  dispensedQty: number;
  dose: string | null;
  frequency: string | null;
  duration: string | null;
  instructions: string | null;
  stock: number;
  medication: { name: string; strength: string | null; form: string | null };
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
    Object.fromEntries(items.map((i) => [i.id, Math.max(0, i.quantity - i.dispensedQty)])),
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
    <div className="space-y-4">
      <div className="divide-y divide-border rounded-xl border border-border">
        {items.map((it) => {
          const outstanding = it.quantity - it.dispensedQty;
          const low = it.stock < outstanding;
          return (
            <div key={it.id} className="flex flex-wrap items-center gap-3 p-3">
              <div className="min-w-0 flex-1">
                <div className="font-medium">
                  {it.medication.name} {it.medication.strength}
                  <span className="ml-1 text-xs font-normal text-muted-foreground">{it.medication.form}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {[it.dose, it.frequency, it.duration].filter(Boolean).join(" · ")}
                  {it.instructions ? ` — ${it.instructions}` : ""}
                </div>
                <div className="mt-0.5 text-xs">
                  <span className="text-muted-foreground">Prescribed {it.quantity} · dispensed {it.dispensedQty} · </span>
                  <span className={low ? "text-destructive" : "text-muted-foreground"}>stock {it.stock}</span>
                </div>
              </div>
              {canDispense && outstanding > 0 ? (
                <Input
                  type="number"
                  min={0}
                  max={outstanding}
                  className="w-24"
                  value={qty[it.id] ?? 0}
                  onChange={(e) => setQty((s) => ({ ...s, [it.id]: Number(e.target.value) }))}
                />
              ) : (
                <StatusBadge state={it.state} />
              )}
            </div>
          );
        })}
      </div>

      {canDispense && (
        <div className="flex gap-2">
          <Button variant="primary" onClick={dispense} disabled={pending}>
            {pending ? <Loader2 className="animate-spin" /> : <PackageCheck className="size-4" />} Dispense
          </Button>
          <Button variant="ghost" onClick={cancel} disabled={pending} className="text-destructive">
            <XCircle className="size-4" /> Cancel order
          </Button>
        </div>
      )}
    </div>
  );
}
