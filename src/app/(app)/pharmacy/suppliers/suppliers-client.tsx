"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus, Pencil, Save } from "lucide-react";
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
import { saveSupplierAction } from "./actions";

export type Supplier = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
};

function SupplierDialog({
  supplier,
  trigger,
}: {
  supplier?: Supplier;
  trigger: React.ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState<string>();
  const [pending, start] = React.useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    start(async () => {
      const r = await saveSupplierAction({}, fd);
      if (r.ok) {
        toast.success(supplier ? "Supplier updated" : "Supplier added");
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
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{supplier ? "Edit supplier" : "Add supplier"}</DialogTitle>
          <DialogDescription>Suppliers can be linked to received stock batches.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {supplier && <input type="hidden" name="id" value={supplier.id} />}
          <div className="space-y-1.5">
            <Label htmlFor="name">Name *</Label>
            <Input id="name" name="name" required defaultValue={supplier?.name} placeholder="e.g. Ethio Pharma PLC" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" defaultValue={supplier?.phone ?? ""} placeholder="+251…" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" defaultValue={supplier?.email ?? ""} placeholder="sales@…" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="address">Address</Label>
            <Textarea id="address" name="address" defaultValue={supplier?.address ?? ""} placeholder="City, street…" />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={pending}>
              {pending ? <Loader2 className="animate-spin" /> : <Save className="size-4" />} Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AddSupplierButton() {
  return (
    <SupplierDialog
      trigger={
        <Button variant="primary">
          <Plus className="size-4" /> Add supplier
        </Button>
      }
    />
  );
}

export function EditSupplierButton({ supplier }: { supplier: Supplier }) {
  return (
    <SupplierDialog
      supplier={supplier}
      trigger={
        <Button variant="ghost" size="icon-sm" aria-label="Edit supplier">
          <Pencil className="size-4" />
        </Button>
      }
    />
  );
}
