import Link from "next/link";
import {
  PackageX,
  CalendarClock,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { expiryClass, expiryLabel, formatDate } from "@/app/(app)/pharmacy/inventory/expiry";

export interface AlertBatch {
  id: string;
  batchNo: string;
  medicationId: string;
  medicationName: string;
  quantity: number;
  unit: string;
  expiryDate: Date;
}

export interface AlertMed {
  id: string;
  name: string;
  strength: string | null;
  unit: string;
  onHand: number;
  reorderLevel: number;
}

function ZoneCard({
  title,
  icon: Icon,
  iconClass,
  count,
  countTone,
  cta,
  ctaHref,
  empty,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  iconClass: string;
  count: number;
  countTone: "danger" | "warning" | "success";
  cta: string;
  ctaHref: string;
  empty: string;
  children: React.ReactNode;
}) {
  const badgeVariant = count === 0 ? "success" : countTone;
  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-row items-center justify-between gap-2 border-b border-border pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className={iconClass} /> {title}
        </CardTitle>
        <Badge variant={badgeVariant} className="tabular-nums">
          {count}
        </Badge>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col p-0">
        {count === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 px-5 py-10 text-center">
            <CheckCircle2 className="size-6 text-success" />
            <p className="text-sm text-muted-foreground">{empty}</p>
          </div>
        ) : (
          <>
            <ul className="max-h-80 flex-1 divide-y divide-border overflow-y-auto">{children}</ul>
            <Link
              href={ctaHref}
              className="group flex items-center justify-between border-t border-border px-5 py-3 text-sm font-medium text-primary hover:bg-muted/50"
            >
              {cta}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function BatchRow({ b }: { b: AlertBatch }) {
  return (
    <li>
      <Link
        href={`/pharmacy/inventory/${b.medicationId}`}
        className="flex items-center justify-between gap-3 px-5 py-2.5 hover:bg-muted/50"
      >
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium text-foreground">{b.medicationName}</span>
          <span className="text-xs text-muted-foreground">
            <span className="font-mono">{b.batchNo}</span> ·{" "}
            <span className="tabular-nums">
              {b.quantity} {b.unit}
            </span>
          </span>
        </span>
        <span className="shrink-0 text-right">
          <span className={`block text-xs tabular-nums ${expiryClass(b.expiryDate)}`}>
            {formatDate(b.expiryDate)}
          </span>
          <span className={`block text-[11px] ${expiryClass(b.expiryDate)}`}>{expiryLabel(b.expiryDate)}</span>
        </span>
      </Link>
    </li>
  );
}

/**
 * The pharmacist's daily control panel: three scannable zones — expired stock,
 * stock expiring within 90 days, and medicines at or below the reorder level.
 */
export function StockAlerts({
  expired,
  expiring,
  lowStock,
}: {
  expired: AlertBatch[];
  expiring: AlertBatch[];
  lowStock: AlertMed[];
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <ZoneCard
        title="Expired stock"
        icon={PackageX}
        iconClass="size-4 text-destructive"
        count={expired.length}
        countTone="danger"
        cta="Write off expired stock"
        ctaHref="/pharmacy/inventory?tab=expiring"
        empty="No expired batches on the shelf."
      >
        {expired.map((b) => (
          <BatchRow key={b.id} b={b} />
        ))}
      </ZoneCard>

      <ZoneCard
        title="Expiring ≤90 days"
        icon={CalendarClock}
        iconClass="size-4 text-warning"
        count={expiring.length}
        countTone="warning"
        cta="Review expiring batches"
        ctaHref="/pharmacy/inventory"
        empty="Nothing expiring in the next 90 days."
      >
        {expiring.map((b) => (
          <BatchRow key={b.id} b={b} />
        ))}
      </ZoneCard>

      <ZoneCard
        title="Low / out of stock"
        icon={AlertTriangle}
        iconClass="size-4 text-warning"
        count={lowStock.length}
        countTone="danger"
        cta="Receive stock"
        ctaHref="/pharmacy/inventory"
        empty="Every medicine is above its reorder level."
      >
        {lowStock.map((m) => (
          <li key={m.id}>
            <Link
              href={`/pharmacy/inventory/${m.id}`}
              className="flex items-center justify-between gap-3 px-5 py-2.5 hover:bg-muted/50"
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-foreground">
                  {m.name}
                  {m.strength ? <span className="text-muted-foreground"> · {m.strength}</span> : null}
                </span>
                <span className="text-xs text-muted-foreground">reorder at {m.reorderLevel}</span>
              </span>
              <span
                className={
                  m.onHand === 0
                    ? "shrink-0 rounded-full bg-destructive/15 px-2 py-0.5 text-xs font-semibold tabular-nums text-destructive"
                    : "shrink-0 rounded-full bg-warning/15 px-2 py-0.5 text-xs font-semibold tabular-nums text-warning"
                }
              >
                {m.onHand} {m.unit}
              </span>
            </Link>
          </li>
        ))}
      </ZoneCard>
    </div>
  );
}
