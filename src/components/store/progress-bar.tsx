import { cn } from "@/lib/utils";

const FILL = {
  brand: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  info: "bg-info",
  gold: "bg-[var(--gold)]",
} as const;

/**
 * Thin, quiet progress meter used for purchase-order receipt completion and
 * asset availability. Server-friendly (no client hooks).
 */
export function ProgressBar({
  value,
  max,
  tone = "brand",
  className,
}: {
  value: number;
  max: number;
  tone?: keyof typeof FILL;
  className?: string;
}) {
  const pct = max > 0 ? Math.min(100, Math.max(0, Math.round((value / max) * 100))) : 0;
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-muted", className)}>
      <div
        className={cn("h-full rounded-full transition-all", FILL[tone])}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
