"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ArrowLeftRight, BedDouble } from "lucide-react";
import type { Affordance } from "@/server/fsm/engine";
import type { AdmissionTransitionPayload } from "@/server/services/ward";
import type { ButtonProps } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { advanceAdmission, moveBed } from "./actions";

const selectCls =
  "flex h-10 w-full rounded-lg border border-input bg-card px-3 text-sm shadow-sm focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/40 outline-none";

export interface BedOption {
  id: string;
  label: string;
  wardName: string;
}

function intentVariant(intent: string): ButtonProps["variant"] {
  switch (intent) {
    case "primary":
      return "primary";
    case "success":
      return "success";
    case "danger":
      return "destructive";
    default:
      return "default";
  }
}

export function AdmissionActions({
  admissionId,
  affordances,
  availableBeds,
  currentBedId,
}: {
  admissionId: string;
  affordances: Affordance[];
  availableBeds: BedOption[];
  currentBedId: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  const [dialog, setDialog] = React.useState<Affordance | null>(null);

  const run = React.useCallback(
    (event: string, payload: AdmissionTransitionPayload) => {
      startTransition(async () => {
        const r = await advanceAdmission(admissionId, event as never, payload);
        if (r.ok) {
          toast.success("Updated");
          setDialog(null);
          router.refresh();
        } else {
          toast.error(r.error ?? "Action failed");
        }
      });
    },
    [admissionId, router],
  );

  return (
    <div className="space-y-4">
      {affordances.length === 0 ? (
        <p className="text-sm text-muted-foreground">No actions available in this state for your role.</p>
      ) : (
        <div className="grid gap-2">
          {affordances.map((a) => (
            <Button
              key={a.event + a.to}
              variant={intentVariant(a.intent)}
              className="justify-start"
              disabled={pending}
              onClick={() => (a.form === "discharge" ? setDialog(a) : run(a.event, {}))}
            >
              {a.label}
            </Button>
          ))}
        </div>
      )}

      <BedTransfer
        admissionId={admissionId}
        availableBeds={availableBeds}
        currentBedId={currentBedId}
        disabled={pending}
        onDone={() => router.refresh()}
      />

      {dialog && (
        <DischargeDialog
          affordance={dialog}
          pending={pending}
          onCancel={() => setDialog(null)}
          onSubmit={(notes) => run(dialog.event, { dischargeNotes: notes })}
        />
      )}
    </div>
  );
}

function BedTransfer({
  admissionId,
  availableBeds,
  currentBedId,
  disabled,
  onDone,
}: {
  admissionId: string;
  availableBeds: BedOption[];
  currentBedId: string | null;
  disabled: boolean;
  onDone: () => void;
}) {
  const [bedId, setBedId] = React.useState("");
  const [pending, startTransition] = React.useTransition();

  if (availableBeds.length === 0) return null;

  const submit = () => {
    if (!bedId) return;
    startTransition(async () => {
      const r = await moveBed(admissionId, bedId);
      if (r.ok) {
        toast.success("Patient moved");
        setBedId("");
        onDone();
      } else {
        toast.error(r.error ?? "Transfer failed");
      }
    });
  };

  return (
    <div className="space-y-2 rounded-lg border border-border p-3">
      <Label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <ArrowLeftRight className="size-3.5" /> Transfer bed
      </Label>
      <select
        className={selectCls}
        value={bedId}
        onChange={(e) => setBedId(e.target.value)}
        disabled={disabled || pending}
      >
        <option value="">Select an available bed…</option>
        {availableBeds.map((b) => (
          <option key={b.id} value={b.id} disabled={b.id === currentBedId}>
            {b.wardName} · {b.label}
          </option>
        ))}
      </select>
      <Button variant="outline" size="sm" className="w-full" disabled={!bedId || disabled || pending} onClick={submit}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : <BedDouble className="size-4" />} Move patient
      </Button>
    </div>
  );
}

function DischargeDialog({
  affordance,
  pending,
  onCancel,
  onSubmit,
}: {
  affordance: Affordance;
  pending: boolean;
  onCancel: () => void;
  onSubmit: (notes: string) => void;
}) {
  const [notes, setNotes] = React.useState("");
  return (
    <Dialog open onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{affordance.label}</DialogTitle>
          <DialogDescription>
            Record discharge notes. This frees the bed and closes the linked visit.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(notes);
          }}
          className="space-y-3"
        >
          <div className="space-y-1.5">
            <Label>Discharge notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Condition on discharge, follow-up instructions, medications…"
              rows={5}
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onCancel} disabled={pending}>
              Cancel
            </Button>
            <Button type="submit" variant="success" disabled={pending}>
              {pending && <Loader2 className="size-4 animate-spin" />} Confirm discharge
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
