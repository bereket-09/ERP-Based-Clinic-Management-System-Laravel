import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Section container for the command center. A quiet, machined "tray" — hairline
 * ring, soft tinted shadow, generous rounding — with an optional titled header
 * and a trailing link. Server-friendly (no client hooks).
 */
export function Panel({
  title,
  description,
  icon: Icon,
  action,
  accent = false,
  className,
  bodyClassName,
  children,
}: {
  title?: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  action?: { label: string; href: string };
  /** Draw a subtle gold hairline for emphasis panels. */
  accent?: boolean;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl border bg-card text-card-foreground",
        "shadow-[0_1px_2px_rgba(14,26,47,0.05),0_8px_24px_-16px_rgba(14,26,47,0.28)]",
        accent ? "border-gold/30" : "border-border",
        className,
      )}
    >
      {(title || action) && (
        <header className="flex items-center justify-between gap-3 px-5 pt-5">
          <div className="flex items-center gap-2.5 min-w-0">
            {Icon && (
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <Icon className="size-4" />
              </span>
            )}
            <div className="min-w-0">
              {title && (
                <h2 className="truncate text-sm font-semibold tracking-tight text-foreground">
                  {title}
                </h2>
              )}
              {description && (
                <p className="truncate text-xs text-muted-foreground">{description}</p>
              )}
            </div>
          </div>
          {action && (
            <Link
              href={action.href}
              className="group inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {action.label}
              <ArrowUpRight className="size-3.5 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          )}
        </header>
      )}
      <div className={cn("flex-1 p-5", (title || action) && "pt-4", bodyClassName)}>
        {children}
      </div>
    </section>
  );
}
