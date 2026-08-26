import { AlertTriangle, ChevronUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Compact, clinical priority indicator. EMERGENCY / URGENT read loudly;
 * ROUTINE stays quiet so the eye is drawn to what matters. Server component.
 */
export function PriorityPill({
  priority,
  className,
}: {
  priority: string;
  className?: string;
}) {
  const map = {
    EMERGENCY: {
      label: "STAT",
      icon: AlertTriangle,
      cls: "bg-destructive/15 text-destructive ring-destructive/20",
    },
    URGENT: {
      label: "Urgent",
      icon: ChevronUp,
      cls: "bg-warning/15 text-warning ring-warning/20",
    },
    ROUTINE: {
      label: "Routine",
      icon: Minus,
      cls: "bg-muted text-muted-foreground ring-border",
    },
  } as const;
  const cfg = map[priority as keyof typeof map] ?? map.ROUTINE;
  const Icon = cfg.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset",
        cfg.cls,
        className,
      )}
    >
      <Icon className="size-3" />
      {cfg.label}
    </span>
  );
}
