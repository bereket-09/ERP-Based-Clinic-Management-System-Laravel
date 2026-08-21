import Link from "next/link";
import { format } from "date-fns";
import {
  ShoppingCart,
  ClipboardList,
  PackageCheck,
  History,
  type LucideIcon,
} from "lucide-react";
import { humanize, cn } from "@/lib/utils";
import { EmptyState } from "@/components/empty-state";

export type TimelineEntry = {
  id: string;
  entityType: string;
  event: string;
  fromState: string;
  toState: string;
  note?: string | null;
  createdAt: Date;
  actorName?: string | null;
  href?: string;
};

const ICONS: Record<string, LucideIcon> = {
  PurchaseOrder: ShoppingCart,
  StockRequest: ClipboardList,
  AssetAssignment: PackageCheck,
};

/**
 * Chronological ledger of store activity, sourced from StateTransition rows.
 * Used on the store dashboard and the purchase-order detail. Server component.
 */
export function StoreTimeline({
  entries,
  emptyDescription = "Store activity will be recorded here as it happens.",
  className,
}: {
  entries: TimelineEntry[];
  emptyDescription?: string;
  className?: string;
}) {
  if (entries.length === 0) {
    return (
      <EmptyState
        title="No activity yet"
        description={emptyDescription}
        icon={History}
        className={cn("m-1", className)}
      />
    );
  }

  return (
    <ol className={cn("relative space-y-4", className)}>
      {entries.map((t, i) => {
        const Icon = ICONS[t.entityType] ?? History;
        const isLast = i === entries.length - 1;
        const row = (
          <>
            <span className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground">
              <Icon className="size-4" />
            </span>
            <div className="min-w-0 flex-1 pb-1">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <span className="text-sm font-medium text-foreground">{humanize(t.event)}</span>
                {t.fromState !== "—" && (
                  <span className="text-xs text-muted-foreground">
                    {humanize(t.fromState)} → {humanize(t.toState)}
                  </span>
                )}
              </div>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {t.actorName ?? "System"} · {format(t.createdAt, "dd MMM yyyy, HH:mm")}
                {t.note ? ` · ${t.note}` : ""}
              </p>
            </div>
          </>
        );
        return (
          <li key={t.id} className="relative flex gap-3">
            {!isLast && (
              <span className="absolute left-4 top-8 -ml-px h-full w-px bg-border" aria-hidden />
            )}
            {t.href ? (
              <Link
                href={t.href}
                className="flex flex-1 gap-3 rounded-lg outline-none transition-colors hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring"
              >
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
