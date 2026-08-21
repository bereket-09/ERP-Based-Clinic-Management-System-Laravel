import { cn } from "@/lib/utils";

/**
 * A compact ring gauge (conic-gradient) for ratios like ward occupancy. No
 * dependencies, works in both themes. Server component.
 */
export function RadialGauge({
  value,
  max,
  label,
  caption,
  className,
}: {
  value: number;
  max: number;
  label?: string;
  caption?: string;
  className?: string;
}) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  const tone =
    pct >= 90 ? "var(--destructive)" : pct >= 70 ? "var(--gold)" : "var(--primary)";

  return (
    <div className={cn("flex items-center gap-4", className)}>
      <div
        className="relative grid size-[92px] shrink-0 place-items-center rounded-full"
        style={{
          background: `conic-gradient(${tone} ${pct * 3.6}deg, var(--muted) 0deg)`,
        }}
      >
        <div className="grid size-[70px] place-items-center rounded-full bg-card">
          <span className="text-lg font-semibold tabular-nums leading-none text-foreground">
            {pct}%
          </span>
        </div>
      </div>
      <div className="min-w-0">
        <div className="text-2xl font-semibold tabular-nums leading-none text-foreground">
          {value}
          <span className="text-base font-medium text-muted-foreground"> / {max}</span>
        </div>
        {label && <div className="mt-1 text-[13px] font-medium text-foreground">{label}</div>}
        {caption && <div className="text-xs text-muted-foreground">{caption}</div>}
      </div>
    </div>
  );
}
