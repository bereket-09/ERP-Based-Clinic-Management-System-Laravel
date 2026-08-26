"use client";
import { useActionState } from "react";
import Link from "next/link";
import { Loader2, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createMedicationAction, type FormState } from "../actions";

export function NewMedicineForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(createMedicationAction, {});

  return (
    <form action={action} className="space-y-6">
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
          <Input id="form" name="form" placeholder="e.g. Capsule, Syrup, Injection" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="category">Category</Label>
          <Input id="category" name="category" placeholder="e.g. Antibiotic" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="unit">Unit</Label>
          <Input id="unit" name="unit" defaultValue="unit" placeholder="unit, ml, vial…" />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="reorderLevel">Reorder level</Label>
          <Input id="reorderLevel" name="reorderLevel" type="number" min={0} defaultValue={20} />
          <p className="text-xs text-muted-foreground">You&apos;ll be alerted when on-hand stock drops to or below this level.</p>
        </div>
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <div className="flex gap-2">
        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? <Loader2 className="animate-spin" /> : <PlusCircle className="size-4" />} Create medicine
        </Button>
        <Button type="button" variant="ghost" asChild>
          <Link href="/pharmacy/inventory">Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
