import { format } from "date-fns";

const DAY = 1000 * 60 * 60 * 24;

/** Whole days until `date` (negative if already past). */
export function daysUntil(date: Date | string): number {
  const d = typeof date === "string" ? new Date(date) : date;
  return Math.ceil((d.getTime() - Date.now()) / DAY);
}

export function isExpired(date: Date | string | null | undefined): boolean {
  if (!date) return false;
  return daysUntil(date) < 0;
}

/** True when a batch expires within `days` days (default 60), including already expired. */
export function isExpiringSoon(date: Date | string | null | undefined, days = 60): boolean {
  if (!date) return false;
  return daysUntil(date) <= days;
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "dd MMM yyyy");
}

/**
 * Full Tailwind text-colour class for an expiry date — static strings so the
 * JIT compiler keeps them:
 *   expired → destructive, ≤30d → destructive, ≤60d → warning, else muted.
 */
export function expiryClass(date: Date | string | null | undefined): string {
  if (!date) return "text-muted-foreground";
  const d = daysUntil(date);
  if (d < 0) return "text-destructive font-medium";
  if (d <= 30) return "text-destructive font-medium";
  if (d <= 60) return "text-warning font-medium";
  return "text-foreground";
}

/** Short human label like "expired", "12d left". */
export function expiryLabel(date: Date | string): string {
  const d = daysUntil(date);
  if (d < 0) return `expired ${Math.abs(d)}d ago`;
  if (d === 0) return "expires today";
  return `${d}d left`;
}
