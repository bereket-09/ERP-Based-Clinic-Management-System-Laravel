import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

const TONES = {
  brand: "bg-accent text-accent-foreground",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  info: "bg-info/15 text-info",
  danger: "bg-destructive/15 text-destructive",
} as const;

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "brand",
  href,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: keyof typeof TONES;
  href?: string;
}) {
  const inner = (
    <Card
      className={cn(
        "flex items-center gap-4 p-5 transition-shadow",
        href && "hover:shadow-md",
      )}
    >
      <span className={cn("flex size-12 items-center justify-center rounded-xl", TONES[tone])}>
        <Icon className="size-6" />
      </span>
      <div className="min-w-0">
        <div className="text-2xl font-semibold tracking-tight text-foreground">{value}</div>
        <div className="truncate text-sm text-muted-foreground">{label}</div>
        {hint && <div className="mt-0.5 text-xs text-muted-foreground/80">{hint}</div>}
      </div>
    </Card>
  );
  return href ? (
    <Link href={href} className="block">
      {inner}
    </Link>
  ) : (
    inner
  );
}
