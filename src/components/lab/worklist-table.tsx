import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Beaker, ChevronRight, Clock, FlaskConical, Stethoscope } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { initials } from "@/lib/utils";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PriorityPill } from "./priority-pill";

export type WorklistOrder = Prisma.LabOrderGetPayload<{
  include: {
    items: { include: { test: { select: { specimen: true } } } };
    visit: { include: { patient: true } };
    orderedBy: true;
  };
}>;

/** Order age in whole hours, used to surface specimens that are ageing. */
function ageHours(from: Date) {
  return (Date.now() - new Date(from).getTime()) / 36e5;
}

/** Compact elapsed turnaround, e.g. "3h 12m" or "45m". */
function turnaround(from: Date) {
  const mins = Math.max(0, Math.round((Date.now() - new Date(from).getTime()) / 6e4));
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function WorklistTable({
  orders,
  empty,
  showState = true,
}: {
  orders: WorklistOrder[];
  empty: string;
  showState?: boolean;
}) {
  if (orders.length === 0) {
    return <EmptyState title={empty} icon={FlaskConical} className="m-4" />;
  }
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead>Patient / accession</TableHead>
          <TableHead className="hidden md:table-cell">Ordering doctor</TableHead>
          <TableHead className="hidden lg:table-cell">Specimen</TableHead>
          <TableHead className="text-center">Tests</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead className="hidden sm:table-cell">TAT</TableHead>
          {showState && <TableHead>Status</TableHead>}
          <TableHead className="w-8" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((o) => {
          const hrs = ageHours(o.createdAt);
          const stale = hrs >= 4 && ["ORDERED", "COLLECTING", "IN_PROGRESS"].includes(o.state);
          const specimens = [
            ...new Set(o.items.map((i) => i.test.specimen).filter(Boolean)),
          ] as string[];
          return (
            <TableRow key={o.id} className="group relative cursor-pointer">
              <TableCell>
                <div className="flex items-center gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
                    {initials(o.visit.patient.name)}
                  </span>
                  <div className="min-w-0">
                    <Link
                      href={`/lab/${o.id}`}
                      className="font-medium text-foreground after:absolute after:inset-0 group-hover:text-primary"
                    >
                      {o.visit.patient.name}
                    </Link>
                    <div className="text-xs text-muted-foreground">
                      <span className="font-mono">{o.visit.patient.mrn}</span>
                      <span className="mx-1.5">·</span>
                      <span className="font-mono uppercase tracking-tight text-primary/80">
                        ACC {o.orderNo}
                      </span>
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {o.orderedBy ? (
                  <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Stethoscope className="size-3.5 shrink-0" />
                    {o.orderedBy.name}
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                {specimens.length ? (
                  <div className="flex flex-wrap gap-1">
                    {specimens.map((s) => (
                      <span
                        key={s}
                        className="inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground"
                      >
                        <Beaker className="size-3" />
                        {s}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell className="text-center">
                <span className="inline-flex min-w-6 items-center justify-center rounded-md bg-muted px-1.5 py-0.5 text-xs font-semibold tabular-nums text-foreground">
                  {o.items.length}
                </span>
              </TableCell>
              <TableCell>
                <PriorityPill priority={o.priority} />
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                <span
                  className={
                    stale
                      ? "inline-flex items-center gap-1 text-sm font-medium tabular-nums text-warning"
                      : "inline-flex items-center gap-1 text-sm tabular-nums text-muted-foreground"
                  }
                  title={`Ordered ${formatDistanceToNow(o.createdAt, { addSuffix: true })}`}
                >
                  <Clock className="size-3.5" />
                  {turnaround(o.createdAt)}
                </span>
              </TableCell>
              {showState && (
                <TableCell>
                  <StatusBadge state={o.state} />
                </TableCell>
              )}
              <TableCell>
                <ChevronRight className="size-4 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-foreground" />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
