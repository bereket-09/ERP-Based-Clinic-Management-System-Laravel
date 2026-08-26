"use client";
import * as React from "react";
import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
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
import { transitionLeaveAction, type LeaveActionState } from "./actions";

export interface Affordance {
  event: string;
  label: string;
  description?: string;
  intent: "primary" | "default" | "danger" | "success";
  form?: string;
}

const VARIANT: Record<Affordance["intent"], ButtonProps["variant"]> = {
  primary: "primary",
  success: "success",
  danger: "destructive",
  default: "default",
};

export function LeaveActions({
  leaveId,
  affordances,
}: {
  leaveId: string;
  affordances: Affordance[];
}) {
  if (affordances.length === 0) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }
  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      {affordances.map((a) =>
        a.form === "leaveDecision" ? (
          <DecisionAction key={a.event} leaveId={leaveId} affordance={a} />
        ) : (
          <QuickAction key={a.event} leaveId={leaveId} affordance={a} />
        ),
      )}
    </div>
  );
}

function QuickAction({ leaveId, affordance }: { leaveId: string; affordance: Affordance }) {
  const [state, action, pending] = useActionState<LeaveActionState, FormData>(
    transitionLeaveAction,
    {},
  );
  return (
    <form action={action} className="inline">
      <input type="hidden" name="leaveId" value={leaveId} />
      <input type="hidden" name="event" value={affordance.event} />
      <Button
        type="submit"
        size="sm"
        variant={VARIANT[affordance.intent]}
        disabled={pending}
        title={state.error ?? affordance.description}
      >
        {pending && <Loader2 className="animate-spin" />}
        {affordance.label}
      </Button>
    </form>
  );
}

function DecisionAction({ leaveId, affordance }: { leaveId: string; affordance: Affordance }) {
  const [open, setOpen] = React.useState(false);
  const [state, action, pending] = useActionState<LeaveActionState, FormData>(
    transitionLeaveAction,
    {},
  );

  React.useEffect(() => {
    if (state.ok) setOpen(false);
  }, [state.ok]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button size="sm" variant={VARIANT[affordance.intent]} onClick={() => setOpen(true)}>
        {affordance.label}
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{affordance.label}</DialogTitle>
          <DialogDescription>
            Add an optional note for the employee, then confirm your decision.
          </DialogDescription>
        </DialogHeader>
        <form action={action} className="space-y-4">
          <input type="hidden" name="leaveId" value={leaveId} />
          <input type="hidden" name="event" value={affordance.event} />
          {state.error && (
            <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {state.error}
            </p>
          )}
          <div className="space-y-1.5">
            <Label htmlFor={`comment-${leaveId}-${affordance.event}`}>Decision note</Label>
            <Textarea
              id={`comment-${leaveId}-${affordance.event}`}
              name="decisionComment"
              placeholder="Optional comment shared with the employee…"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant={VARIANT[affordance.intent]} disabled={pending}>
              {pending && <Loader2 className="animate-spin" />}
              {affordance.label}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
