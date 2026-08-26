"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Loader2, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { setLeaveBalanceAction } from "./actions";

/** Prev / next year navigation for leave balances. */
export function YearNav({ year }: { year: number }) {
  const router = useRouter();

  function go(y: number) {
    router.push(`/hr/leave-balances?year=${y}`);
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="icon-sm" aria-label="Previous year" onClick={() => go(year - 1)}>
        <ChevronLeft className="size-4" />
      </Button>
      <span className="min-w-[3.5rem] text-center text-sm font-semibold">{year}</span>
      <Button variant="outline" size="icon-sm" aria-label="Next year" onClick={() => go(year + 1)}>
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}

/** One entitled/used/remaining cell with an inline edit dialog. */
export function BalanceCell({
  userId,
  userName,
  type,
  typeLabel,
  year,
  entitled,
  used,
}: {
  userId: string;
  userName: string;
  type: string;
  typeLabel: string;
  year: number;
  entitled: number;
  used: number;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState<string>();
  const [pending, start] = React.useTransition();

  const remaining = entitled - used;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("userId", userId);
    fd.set("type", type);
    fd.set("year", String(year));
    start(async () => {
      const r = await setLeaveBalanceAction({}, fd);
      if (r.ok) {
        toast.success("Leave balance updated");
        setError(undefined);
        setOpen(false);
        router.refresh();
      } else {
        setError(r.error);
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full flex-col items-center gap-0.5 rounded-lg border border-border px-2 py-1.5 text-center transition-colors hover:bg-muted"
      >
        <span
          className={cn(
            "text-sm font-semibold",
            entitled === 0
              ? "text-muted-foreground"
              : remaining <= 0
                ? "text-destructive"
                : "text-foreground",
          )}
        >
          {remaining} <span className="font-normal text-muted-foreground">/ {entitled}</span>
        </span>
        <span className="text-[11px] text-muted-foreground">{used} used</span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit leave balance</DialogTitle>
            <DialogDescription>
              {userName} · {typeLabel} · {year}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}
            <div className="space-y-1.5">
              <Label htmlFor={`entitled-${userId}-${type}`}>Entitled days</Label>
              <Input
                id={`entitled-${userId}-${type}`}
                name="entitled"
                type="number"
                min={0}
                max={365}
                required
                defaultValue={entitled}
              />
              <p className="text-xs text-muted-foreground">
                {used} day(s) already used · {remaining} remaining at current entitlement.
              </p>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={pending}>
                {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
