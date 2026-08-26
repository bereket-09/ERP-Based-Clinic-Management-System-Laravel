"use client";
import * as React from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, PlusCircle, PackagePlus } from "lucide-react";
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
import { createMedicationAction, receiveStockAction, type FormState } from "./actions";

const selectCls =
  "flex h-10 w-full rounded-lg border border-input bg-card px-3 text-sm shadow-sm focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/40 outline-none";

export type MedOption = { id: string; label: string };
export type SupplierOption = { id: string; name: string };

/* --------------------------- Add medicine --------------------------- */

export function AddMedicineDialog() {
  const [open, setOpen] = React.useState(false);
  // createMedicationAction redirects on success, so we only surface errors here.
  const [state, action, pending] = useActionState<FormState, FormData>(createMedicationAction, {});

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="primary">
          <PlusCircle className="size-4" /> Add medicine
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add medicine</DialogTitle>
          <DialogDescription>Create a new medication in the formulary.</DialogDescription>
        </DialogHeader>
        <form action={action} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" name="name" required placeholder="e.g. Amoxicillin" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="strength">Strength</Label>
              <Input id="strength" name="strength" placeholder="e.g. 500mg" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="form">Form</Label>
              <Input id="form" name="form" placeholder="e.g. Capsule" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="category">Category</Label>
              <Input id="category" name="category" placeholder="e.g. Antibiotic" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="unit">Unit</Label>
              <Input id="unit" name="unit" placeholder="unit" defaultValue="unit" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="reorderLevel">Reorder level</Label>
              <Input id="reorderLevel" name="reorderLevel" type="number" min={0} defaultValue={20} />
            </div>
          </div>
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={pending}>
              {pending ? <Loader2 className="animate-spin" /> : <PlusCircle className="size-4" />} Save medicine
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* --------------------------- Receive stock --------------------------- */

export function ReceiveStockFields({
  meds,
  suppliers,
  fixedMedicationId,
}: {
  meds?: MedOption[];
  suppliers: SupplierOption[];
  fixedMedicationId?: string;
}) {
  const today = new Date();
  const defaultExpiry = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate())
    .toISOString()
    .slice(0, 10);
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {fixedMedicationId ? (
        <input type="hidden" name="medicationId" value={fixedMedicationId} />
      ) : (
        <div className="space-y-1.5 sm:col-span-2">
          <Label>Medicine *</Label>
          <select name="medicationId" className={selectCls} defaultValue="" required>
            <option value="" disabled>
              Select a medicine…
            </option>
            {meds?.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="batchNo">Batch number *</Label>
        <Input id="batchNo" name="batchNo" required placeholder="e.g. LOT-2026-114" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="expiryDate">Expiry date *</Label>
        <Input id="expiryDate" name="expiryDate" type="date" required defaultValue={defaultExpiry} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="quantity">Quantity *</Label>
        <Input id="quantity" name="quantity" type="number" min={1} required placeholder="0" />
      </div>
      <div className="space-y-1.5">
        <Label>Supplier</Label>
        <select name="supplierId" className={selectCls} defaultValue="">
          <option value="">—</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="costPrice">Cost price (ETB)</Label>
        <Input id="costPrice" name="costPrice" type="number" min={0} step="0.01" defaultValue={0} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="sellPrice">Sell price (ETB)</Label>
        <Input id="sellPrice" name="sellPrice" type="number" min={0} step="0.01" defaultValue={0} />
      </div>
    </div>
  );
}

export function ReceiveStockDialog({
  meds,
  suppliers,
  fixedMedicationId,
  trigger,
}: {
  meds?: MedOption[];
  suppliers: SupplierOption[];
  fixedMedicationId?: string;
  trigger?: React.ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState<string>();
  const [pending, start] = React.useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    start(async () => {
      const r = await receiveStockAction({}, fd);
      if (r.ok) {
        toast.success("Stock received");
        setError(undefined);
        setOpen(false);
        router.refresh();
      } else {
        setError(r.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="default">
            <PackagePlus className="size-4" /> Receive stock
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Receive stock</DialogTitle>
          <DialogDescription>Record a goods-in batch. This adds to on-hand quantity.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <ReceiveStockFields meds={meds} suppliers={suppliers} fixedMedicationId={fixedMedicationId} />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={pending}>
              {pending ? <Loader2 className="animate-spin" /> : <PackagePlus className="size-4" />} Receive
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
