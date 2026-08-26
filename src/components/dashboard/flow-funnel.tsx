import Link from "next/link";
import { cn } from "@/lib/utils";

export type FlowStage = {
  label: string;
  value: number;
  href?: string;
  /** Tailwind background class for the bar fill. */
  bar: string;
};

/**
 * Patient-flow funnel: registered → with doctor → lab/pharmacy → completed.
 * Proportional bars sized against the busiest stage, so the shape of the day is
 * legible at a glance. Pure CSS (server component); bars ease their width in.
 */
export function FlowFunnel({ stages }: { stages: FlowStage[] }) {
  const max = Math.max(1, ...stages.map((s) => s.value));

  return (
    <ol className="space-y-3.5">
      {stages.map((stage) => {
        const pct = Math.round((stage.value / max) * 100);
        const row = (
          <div className="group">
            <div className="mb-1 flex items-baseline justify-between gap-2">
              <span className="text-[13px] font-medium text-foreground">{stage.label}</span>
              <span className="text-sm font-semibold tabular-nums text-foreground">
                {stage.value}
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full transition-[width] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]",
                  stage.bar,
                )}
                style={{ width: `${Math.max(stage.value === 0 ? 0 : 6, pct)}%` }}
              />
            </div>
          </div>
        );

        return (
          <li key={stage.label}>
            {stage.href ? (
              <Link href={stage.href} className="block rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring">
                {row}
              </Link>
            ) : (
              row
            )}
          </li>
        );
      })}
    </ol>
  );
}
