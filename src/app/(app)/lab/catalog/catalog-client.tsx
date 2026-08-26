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
import { Switch } from "@/components/ui/switch";
import { saveLabTestAction, toggleLabTestActiveAction } from "./actions";

export type LabTest = {
  id: string;
  name: string;
  category: string | null;
  specimen: string | null;
  unit: string | null;
  refRangeLow: number | null;
  refRangeHigh: number | null;
  refRangeText: string | null;
  price: number;
  isActive: boolean;
};

function TestDialog({ test, trigger }: { test?: LabTest; trigger: React.ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState<string>();
  const [pending, start] = React.useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    start(async () => {
      const r = await saveLabTestAction({}, fd);
      if (r.ok) {
        toast.success(test ? "Test updated" : "Test added");
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
          <DialogTitle>{test ? "Edit lab test" : "Add lab test"}</DialogTitle>
          <DialogDescription>Tests in the catalog can be ordered by doctors.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {test && <input type="hidden" name="id" value={test.id} />}
          <div className="space-y-1.5">
            <Label htmlFor="name">Name *</Label>
            <Input id="name" name="name" required defaultValue={test?.name} placeholder="e.g. Complete Blood Count" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="category">Category</Label>
              <Input id="category" name="category" defaultValue={test?.category ?? ""} placeholder="e.g. Haematology" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="specimen">Specimen</Label>
              <Input id="specimen" name="specimen" defaultValue={test?.specimen ?? ""} placeholder="e.g. Blood" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="unit">Unit</Label>
              <Input id="unit" name="unit" defaultValue={test?.unit ?? ""} placeholder="e.g. mg/dL" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="price">Price (ETB) *</Label>
              <Input id="price" name="price" type="number" min={0} step="0.01" defaultValue={test?.price ?? 0} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="refRangeLow">Ref range low</Label>
              <Input
                id="refRangeLow"
                name="refRangeLow"
                type="number"
                step="0.01"
                defaultValue={test?.refRangeLow ?? ""}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="refRangeHigh">Ref range high</Label>
              <Input
                id="refRangeHigh"
                name="refRangeHigh"
                type="number"
                step="0.01"
                defaultValue={test?.refRangeHigh ?? ""}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="refRangeText">Reference range (text)</Label>
            <Input
              id="refRangeText"
              name="refRangeText"
              defaultValue={test?.refRangeText ?? ""}
              placeholder="e.g. Negative, or narrative range"
            />
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

export function AddLabTestButton() {
  return (
    <TestDialog
      trigger={
        <Button variant="primary">
          <Plus className="size-4" /> Add test
        </Button>
      }
    />
  );
}

export function EditLabTestButton({ test }: { test: LabTest }) {
  return (
    <TestDialog
      test={test}
      trigger={
        <Button variant="ghost" size="icon-sm" aria-label="Edit test">
          <Pencil className="size-4" />
        </Button>
      }
    />
  );
}

export function LabTestActiveSwitch({ id, isActive }: { id: string; isActive: boolean }) {
  const router = useRouter();
  const [pending, start] = React.useTransition();
  const onChange = () =>
    start(async () => {
      const r = await toggleLabTestActiveAction(id);
      if (r.ok) {
        toast.success(isActive ? "Test deactivated" : "Test activated");
        router.refresh();
      } else {
        toast.error(r.error ?? "Failed");
      }
    });
  return <Switch checked={isActive} onCheckedChange={onChange} disabled={pending} aria-label="Toggle active" />;
}
