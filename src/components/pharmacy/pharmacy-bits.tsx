import { differenceInMinutes, differenceInHours, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Order age helpers — compact "12m / 3h / 2d" labels with urgency     */
/* colouring so a stale prescription reads at a glance.                */
/* ------------------------------------------------------------------ */

/** Compact elapsed-time label since `date` (e.g. "12m", "3h", "2d"). */
export function ageLabel(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const mins = Math.max(0, differenceInMinutes(now, d));
  if (mins < 60) return `${mins}m`;
  const hrs = differenceInHours(now, d);
  if (hrs < 48) return `${hrs}h`;
  return `${differenceInDays(now, d)}d`;
}

/** Tailwind colour class for order age — the longer the wait, the hotter. */
export function ageClass(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const hrs = differenceInHours(new Date(), d);
  if (hrs >= 24) return "text-destructive font-medium";
  if (hrs >= 4) return "text-warning font-medium";
  return "text-muted-foreground";
}

/* ------------------------------------------------------------------ */
/* Priority pill — mirrors the dashboard's priority accents.           */
/* ------------------------------------------------------------------ */

const PRIORITY: Record<string, { label: string; dot: string; text: string }> = {
  EMERGENCY: { label: "Emergency", dot: "bg-destructive", text: "text-destructive" },
  URGENT: { label: "Urgent", dot: "bg-warning", text: "text-warning" },
  ROUTINE: { label: "Routine", dot: "bg-muted-foreground/40", text: "text-muted-foreground" },
};

export function PriorityPill({ priority, className }: { priority: string; className?: string }) {
  const p = PRIORITY[priority] ?? PRIORITY.ROUTINE;
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", p.text, className)}>
      <span className={cn("size-1.5 rounded-full", p.dot)} />
      {p.label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Reorder gauge — on-hand relative to the reorder level.              */
/* ------------------------------------------------------------------ */

export function ReorderBar({
  onHand,
  reorderLevel,
  className,
}: {
  onHand: number;
  reorderLevel: number;
  className?: string;
}) {
  // Scale the bar against 2× the reorder level so "healthy" stock sits ~50%+.
  const ceiling = Math.max(reorderLevel * 2, onHand, 1);
  const pct = Math.min(100, Math.round((onHand / ceiling) * 100));
  const tone =
    onHand <= 0 ? "bg-destructive" : onHand <= reorderLevel ? "bg-warning" : "bg-success";
  return (
    <div className={cn("space-y-1", className)}>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full transition-all", tone)} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span className="tabular-nums">{onHand} on hand</span>
        <span className="tabular-nums">reorder at {reorderLevel}</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Progress bar — generic dispensing / completion progress.           */
/* ------------------------------------------------------------------ */

export function ProgressBar({
  value,
  max,
  className,
  tone = "bg-primary",
}: {
  value: number;
  max: number;
  className?: string;
  tone?: string;
}) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-muted", className)}>
      <div className={cn("h-full rounded-full transition-all", tone)} style={{ width: `${pct}%` }} />
    </div>
  );
}
