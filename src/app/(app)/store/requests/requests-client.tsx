"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus, Send } from "lucide-react";
import type { Affordance } from "@/server/fsm/engine";
import type { ButtonProps } from "@/components/ui/button";
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
import { createStockRequestAction, advanceStockRequestAction } from "./actions";

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

export function NewStockRequestButton() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState<string>();
  const [pending, start] = React.useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    start(async () => {
      const r = await createStockRequestAction({ ok: false }, fd);
      if (r.ok) {
        toast.success("Request submitted");
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
        <Button variant="primary">
          <Plus className="size-4" /> New request
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Raise a stock request</DialogTitle>
          <DialogDescription>Ask the store to supply an item to your department.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="itemName">Item *</Label>
            <Input id="itemName" name="itemName" required placeholder="e.g. A4 paper (ream)" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="quantity">Quantity *</Label>
            <Input id="quantity" name="quantity" type="number" min={1} defaultValue={1} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="reason">Reason</Label>
            <Textarea id="reason" name="reason" placeholder="Why is this needed?" />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={pending}>
              {pending ? <Loader2 className="animate-spin" /> : <Send className="size-4" />} Submit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function StockRequestActions({
  requestId,
  affordances,
}: {
  requestId: string;
  affordances: Affordance[];
}) {
  const router = useRouter();
  const [pending, start] = React.useTransition();

  function run(event: string) {
    start(async () => {
      const r = await advanceStockRequestAction(requestId, event as never);
      if (r.ok) {
        toast.success("Updated");
        router.refresh();
      } else {
        toast.error(r.error ?? "Action failed");
      }
    });
  }

  if (affordances.length === 0) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }

  return (
    <div className="flex flex-wrap justify-end gap-2">
      {affordances.map((a) => (
        <Button
          key={a.event}
          variant={intentVariant(a.intent)}
          size="sm"
          disabled={pending}
          onClick={() => run(a.event)}
        >
          {pending && <Loader2 className="size-4 animate-spin" />} {a.label}
        </Button>
      ))}
    </div>
  );
}
