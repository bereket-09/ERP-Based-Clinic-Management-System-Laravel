import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { cn } from "@/lib/utils";

export type FeedItem = {
  id: string;
  /** Two-letter avatar seed (initials); falls back to a dot marker. */
  avatar?: string;
  title: string;
  subtitle?: string;
  /** Enum-like state → rendered as a StatusBadge. */
  state?: string | null;
  /** Short right-aligned meta (time, order no, amount). */
  meta?: string;
  href?: string;
  /** Priority marker colour class for the left rail. */
  accent?: string;
};

/**
 * Compact list of live records (queue, worklist, dispensing, appointments).
 * Each row is optionally a link; rows show initials, a title/subtitle stack, an
 * optional status badge and trailing meta. Server component.
 */
export function ActivityFeed({
  items,
  empty = { title: "Nothing here yet", description: "New items will appear here in real time." },
}: {
  items: FeedItem[];
  empty?: { title: string; description: string; icon?: React.ComponentType<{ className?: string }> };
}) {
  if (items.length === 0) {
    return <EmptyState title={empty.title} description={empty.description} icon={empty.icon} className="py-8" />;
  }

  return (
    <ul className="-mx-2 divide-y divide-border/70">
      {items.map((item) => {
        const inner = (
          <div
            className={cn(
              "flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors",
              item.href && "hover:bg-muted",
            )}
          >
            {item.avatar ? (
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-[12px] font-semibold text-accent-foreground">
                {item.avatar}
              </span>
            ) : (
              <span className={cn("mt-0.5 size-2 shrink-0 rounded-full", item.accent ?? "bg-primary")} />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-medium text-foreground">{item.title}</span>
                {item.state && <StatusBadge state={item.state} />}
              </div>
              {item.subtitle && (
                <div className="truncate text-xs text-muted-foreground">{item.subtitle}</div>
              )}
            </div>
            {item.meta && (
              <span className="shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground">
                {item.meta}
              </span>
            )}
            {item.href && (
              <ChevronRight className="size-4 shrink-0 text-muted-foreground/50" />
            )}
          </div>
        );

        return (
          <li key={item.id}>
            {item.href ? (
              <Link href={item.href} className="block outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl">
                {inner}
              </Link>
            ) : (
              inner
            )}
          </li>
        );
      })}
    </ul>
  );
}
