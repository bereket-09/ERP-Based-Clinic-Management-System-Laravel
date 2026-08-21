"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, SlidersHorizontal, Power } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toggleMedicationActiveAction } from "../actions";
import { adjustStockAction } from "./actions";

const selectCls =
  "flex h-10 w-full rounded-lg border border-input bg-card px-3 text-sm shadow-sm focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/40 outline-none";

export type BatchOption = { id: string; label: string; onHand: number };

export function AdjustStockDialog({ batches }: { batches: BatchOption[] }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState<string>();
  const [pending, start] = React.useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    start(async () => {
      const r = await adjustStockAction({}, fd);
      if (r.ok) {
        toast.success("Stock adjusted");
        setError(undefined);
        setOpen(false);
        router.refresh();
      } else {
        setError(r.error);
      }
    });
  }

  const disabled = batches.length === 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" disabled={disabled}>
          <SlidersHorizontal className="size-4" /> Adjust stock
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adjust stock</DialogTitle>
          <DialogDescription>
            Correct a batch quantity, write off damage, or mark stock expired. Every change is logged.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Batch *</Label>
            <select name="batchId" className={selectCls} defaultValue="" required>
              <option value="" disabled>
                Select a batch…
              </option>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.label} — {b.onHand} on hand
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Adjustment *</Label>
              <select name="type" className={selectCls} defaultValue="ADJUST_DOWN" required>
                <option value="ADJUST_UP">Increase (stock-take, found)</option>
                <option value="ADJUST_DOWN">Decrease (damage, loss)</option>
                <option value="EXPIRE">Expire (write off)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input id="quantity" name="quantity" type="number" min={1} required placeholder="0" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="reason">Reason *</Label>
            <Textarea id="reason" name="reason" required placeholder="e.g. Damaged in storage" />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={pending}>
              {pending ? <Loader2 className="animate-spin" /> : <SlidersHorizontal className="size-4" />} Apply
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ToggleActiveButton({ id, isActive }: { id: string; isActive: boolean }) {
  const router = useRouter();
  const [pending, start] = React.useTransition();
  const onClick = () =>
    start(async () => {
      const r = await toggleMedicationActiveAction(id);
      if (r.ok) {
        toast.success(isActive ? "Medicine deactivated" : "Medicine activated");
        router.refresh();
      } else {
        toast.error(r.error ?? "Failed");
      }
    });
  return (
    <Button variant={isActive ? "ghost" : "success"} onClick={onClick} disabled={pending}>
      {pending ? <Loader2 className="animate-spin" /> : <Power className="size-4" />}
      {isActive ? "Deactivate" : "Activate"}
    </Button>
  );
}
