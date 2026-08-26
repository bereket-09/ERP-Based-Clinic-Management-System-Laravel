import Link from "next/link";
import { notFound } from "next/navigation";
import { format, differenceInYears } from "date-fns";
import {
  ArrowLeft,
  FlaskConical,
  Stethoscope,
  Clock,
  CheckCircle2,
  TestTubes,
  User,
  StickyNote,
  Beaker,
  Printer,
  Timer,
} from "lucide-react";
import { requireRole } from "@/server/session";
import { db } from "@/server/db";
import { labOrderAffordances } from "@/server/services/lab";
import { humanize } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/status-badge";
import { PriorityPill } from "@/components/lab/priority-pill";
import { LabOrderClient } from "./lab-order-client";

export default async function LabOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const actor = await requireRole("LAB_TECH");
  const { id } = await params;

  const order = await db.labOrder.findUnique({
    where: { id },
    include: {
      items: { include: { test: true } },
      orderedBy: true,
      visit: { include: { patient: true } },
    },
  });
  if (!order) notFound();

  const affordances = labOrderAffordances(order.state, actor);
  const editable = order.state === "IN_PROGRESS";

  const patient = order.visit.patient;
  const age = patient.birthday ? differenceInYears(new Date(), patient.birthday) : null;

  const resulted = order.items.filter((i) => i.state === "RESULTED" || i.state === "VERIFIED").length;
  const abnormal = order.items.filter(
    (i) => i.resultFlag && i.resultFlag !== "NORMAL",
  ).length;
  const reportedAt = order.items
    .map((i) => i.resultedAt)
    .filter((d): d is Date => d != null)
    .sort((a, b) => b.getTime() - a.getTime())[0];
  const specimens = [...new Set(order.items.map((i) => i.test.specimen).filter(Boolean))] as string[];

  // Turnaround time: order placed → results reported (or elapsed so far).
  const tatMs = (reportedAt ?? new Date()).getTime() - order.createdAt.getTime();
  const tatMins = Math.max(0, Math.round(tatMs / 6e4));
  const tatLabel = `${Math.floor(tatMins / 60)}h ${tatMins % 60}m${reportedAt ? "" : " (elapsed)"}`;

  const canPrint = order.state === "RESULTS_READY" || order.state === "COMPLETED";

  return (
    <div className="space-y-6">
      <Link
        href="/lab"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Laboratory worklist
      </Link>

      {/* ── Order header ─────────────────────────────────────────────────── */}
      <Card>
        <CardContent className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/patients/${order.visit.patientId}`}
                  className="text-lg font-semibold text-foreground hover:text-primary"
                >
                  {patient.name}
                </Link>
                <StatusBadge state={order.state} />
                <PriorityPill priority={order.priority} />
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                <span className="font-mono">{patient.mrn}</span>
                {(age != null || patient.gender) && (
                  <>
                    <span>·</span>
                    <span>
                      {age != null ? `${age}y` : ""}
                      {age != null && patient.gender ? " · " : ""}
                      {patient.gender ? humanize(patient.gender) : ""}
                    </span>
                  </>
                )}
                <span>·</span>
                <span className="inline-flex items-center gap-1">
                  <Stethoscope className="size-3.5" />
                  {order.orderedBy?.name ?? "—"}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="text-right">
                <div className="font-mono text-xs font-medium uppercase tracking-tight text-primary/80">
                  ACC {order.orderNo}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Ordered {format(order.createdAt, "PP p")}
                </div>
              </div>
              {canPrint && (
                <Button asChild variant="outline" size="sm">
                  <a href={`/print/lab/${order.id}`} target="_blank" rel="noopener noreferrer">
                    <Printer className="size-4" /> Export / print report
                  </a>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ── Results workspace ──────────────────────────────────────────── */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center gap-2">
            <FlaskConical className="size-4 text-primary" />
            <CardTitle>Test results</CardTitle>
            <span className="ml-auto text-xs text-muted-foreground tabular-nums">
              {resulted}/{order.items.length} resulted
            </span>
          </CardHeader>
          <CardContent>
            <LabOrderClient
              orderId={order.id}
              items={order.items}
              affordances={affordances}
              editable={editable}
            />
            {!editable && (
              <p className="mt-3 text-xs text-muted-foreground">
                {order.state === "ORDERED" || order.state === "COLLECTING"
                  ? `${humanize(order.state)} — advance the order to “In progress” to enter results.`
                  : order.state === "RESULTS_READY"
                    ? "Results have been submitted to the ordering doctor."
                    : humanize(order.state)}
              </p>
            )}
          </CardContent>
        </Card>

        {/* ── Contextual side rail ───────────────────────────────────────── */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex-row items-center gap-2">
              <TestTubes className="size-4 text-primary" />
              <CardTitle>Order summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <SummaryRow icon={TestTubes} label="Tests ordered" value={String(order.items.length)} />
              <SummaryRow icon={CheckCircle2} label="Resulted" value={`${resulted} of ${order.items.length}`} />
              <SummaryRow
                icon={FlaskConical}
                label="Abnormal flags"
                value={abnormal > 0 ? `${abnormal}` : "None"}
                tone={abnormal > 0 ? "warn" : undefined}
              />
              <SummaryRow
                icon={Beaker}
                label="Specimens"
                value={specimens.length ? specimens.join(", ") : "—"}
              />
              <Separator />
              <SummaryRow icon={User} label="Ordering doctor" value={order.orderedBy?.name ?? "—"} />
              <SummaryRow icon={Clock} label="Ordered" value={format(order.createdAt, "PP p")} />
              <SummaryRow
                icon={CheckCircle2}
                label="Reported"
                value={reportedAt ? format(reportedAt, "PP p") : "Not yet"}
              />
              <SummaryRow icon={Timer} label="Turnaround" value={tatLabel} />
            </CardContent>
          </Card>

          {order.notes && (
            <Card>
              <CardHeader className="flex-row items-center gap-2">
                <StickyNote className="size-4 text-primary" />
                <CardTitle>Clinical notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{order.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryRow({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  tone?: "warn";
}) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <span className="inline-flex items-center gap-2 text-muted-foreground">
        <Icon className="size-4 shrink-0" />
        {label}
      </span>
      <span
        className={
          tone === "warn"
            ? "text-right font-medium text-warning"
            : "text-right font-medium text-foreground"
        }
      >
        {value}
      </span>
    </div>
  );
}
