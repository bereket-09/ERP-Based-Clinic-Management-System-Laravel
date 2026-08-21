import Link from "next/link";
import { cn } from "@/lib/utils";

const TONES = {
  brand: "bg-accent text-accent-foreground",
  gold: "bg-gold-soft text-gold-soft-foreground",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  info: "bg-info/15 text-info",
  danger: "bg-destructive/15 text-destructive",
} as const;

export type MetricTone = keyof typeof TONES;

/**
 * A single KPI tile for the bento grid. Big tabular figure, a small icon chip,
 * an optional context line, and an optional trend. Becomes a link when `href` is
 * set (whole tile is the hit target). Server component.
 */
export function MetricTile({
  label,
  value,
  hint,
  icon: Icon,
  tone = "brand",
  href,
  trend,
  className,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: MetricTone;
  href?: string;
  /** e.g. { value: "+12%", direction: "up" } */
  trend?: { value: string; direction: "up" | "down" | "flat" };
  className?: string;
}) {
  const body = (
    <div
      className={cn(
        "group relative flex h-full flex-col justify-between gap-4 rounded-2xl border border-border bg-card p-4 sm:p-5",
        "shadow-[0_1px_2px_rgba(14,26,47,0.05)] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
        href && "hover:-translate-y-0.5 hover:shadow-[0_1px_2px_rgba(14,26,47,0.05),0_14px_30px_-18px_rgba(14,26,47,0.4)]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className={cn(
            "flex size-9 items-center justify-center rounded-xl transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105",
            TONES[tone],
          )}
        >
          <Icon className="size-[18px]" />
        </span>
        {trend && (
          <span
            className={cn(
              "rounded-full px-1.5 py-0.5 text-[11px] font-medium tabular-nums",
              trend.direction === "up" && "bg-success/12 text-success",
              trend.direction === "down" && "bg-destructive/12 text-destructive",
              trend.direction === "flat" && "bg-muted text-muted-foreground",
            )}
          >
            {trend.value}
          </span>
        )}
      </div>
      <div>
        <div className="text-[26px] font-semibold leading-none tracking-tight tabular-nums text-foreground">
          {value}
        </div>
        <div className="mt-1.5 truncate text-[13px] font-medium text-muted-foreground">{label}</div>
        {hint && <div className="mt-0.5 truncate text-xs text-muted-foreground/70">{hint}</div>}
      </div>
    </div>
  );

  return href ? (
    <Link href={href} className="block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-2xl">
      {body}
    </Link>
  ) : (
    body
  );
}
