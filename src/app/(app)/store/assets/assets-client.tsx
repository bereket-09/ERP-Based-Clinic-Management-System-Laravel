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
import { saveAssetAction } from "./actions";

export type AssetRow = {
  id: string;
  tag: string;
  name: string;
  category: string | null;
  serialNo: string | null;
  quantity: number;
  unitPrice: number;
  receiptNo: string | null;
};

function AssetDialog({ asset, trigger }: { asset?: AssetRow; trigger: React.ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState<string>();
  const [pending, start] = React.useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    start(async () => {
      const r = await saveAssetAction({ ok: false }, fd);
      if (r.ok) {
        toast.success(asset ? "Asset updated" : "Asset added");
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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{asset ? "Edit asset" : "Register asset"}</DialogTitle>
          <DialogDescription>Track equipment, furniture and other non-medical items.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {asset && <input type="hidden" name="id" value={asset.id} />}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="tag">Asset tag *</Label>
              <Input id="tag" name="tag" required defaultValue={asset?.tag} placeholder="e.g. AST-0012" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="category">Category</Label>
              <Input id="category" name="category" defaultValue={asset?.category ?? ""} placeholder="e.g. Furniture" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="name">Name *</Label>
            <Input id="name" name="name" required defaultValue={asset?.name} placeholder="e.g. Office chair" />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input id="quantity" name="quantity" type="number" min={1} required defaultValue={asset?.quantity ?? 1} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="unitPrice">Unit price</Label>
              <Input id="unitPrice" name="unitPrice" type="number" step="any" min={0} defaultValue={asset?.unitPrice ?? 0} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="serialNo">Serial no.</Label>
              <Input id="serialNo" name="serialNo" defaultValue={asset?.serialNo ?? ""} placeholder="SN…" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="receiptNo">Receipt no.</Label>
            <Input id="receiptNo" name="receiptNo" defaultValue={asset?.receiptNo ?? ""} placeholder="Purchase receipt reference" />
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

export function AddAssetButton() {
  return (
    <AssetDialog
      trigger={
        <Button variant="primary">
          <Plus className="size-4" /> Register asset
        </Button>
      }
    />
  );
}

export function EditAssetButton({ asset }: { asset: AssetRow }) {
  return (
    <AssetDialog
      asset={asset}
      trigger={
        <Button variant="ghost" size="icon-sm" aria-label="Edit asset">
          <Pencil className="size-4" />
        </Button>
      }
    />
  );
}
