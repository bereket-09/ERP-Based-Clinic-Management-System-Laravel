import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import {
  ArrowLeft,
  Pill,
  Printer,
  User,
  Stethoscope,
  CalendarClock,
  ListChecks,
  ClipboardList,
} from "lucide-react";
import { requireRole } from "@/server/session";
import { db } from "@/server/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { Separator } from "@/components/ui/separator";
import { initials, cn } from "@/lib/utils";
import { PriorityPill, ProgressBar, ageLabel } from "@/components/pharmacy/pharmacy-bits";
import { DispenseClient } from "./dispense-client";

export const metadata = { title: "Dispense order" };

export default async function DrugOrderPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole("PHARMACIST");
  const { id } = await params;

  const [order, queue] = await Promise.all([
    db.drugOrder.findUnique({
      where: { id },
      include: {
        items: { include: { medication: { include: { batches: true } } } },
        prescribedBy: true,
        visit: { include: { patient: true } },
      },
    }),
    db.drugOrder.findMany({
      where: { state: { in: ["ORDERED", "PARTIALLY_DISPENSED"] } },
      include: { items: { select: { id: true } }, visit: { include: { patient: true } } },
      orderBy: [{ visit: { priority: "desc" } }, { createdAt: "asc" }],
      take: 15,
    }),
  ]);
  if (!order) notFound();

  const items = order.items.map((it) => ({
    id: it.id,
    state: it.state,
    quantity: it.quantity,
    dispensedQty: it.dispensedQty,
    dose: it.dose,
    frequency: it.frequency,
    duration: it.duration,
    instructions: it.instructions,
    unit: it.medication.unit,
    stock: it.medication.batches.reduce((s, b) => s + b.quantity, 0),
    medication: { name: it.medication.name, strength: it.medication.strength, form: it.medication.form },
    // FEFO batch lots (earliest expiry first, stocked only) drive the dispense preview.
    batches: it.medication.batches
      .filter((b) => b.quantity > 0)
      .sort((a, b) => a.expiryDate.getTime() - b.expiryDate.getTime())
      .map((b) => ({
        batchNo: b.batchNo,
        expiryDate: b.expiryDate.toISOString(),
        quantity: b.quantity,
        sellPrice: b.sellPrice,
      })),
  }));

  const canDispense = ["ORDERED", "PARTIALLY_DISPENSED"].includes(order.state);
  const totalUnits = items.reduce((s, i) => s + i.quantity, 0);
  const dispensedUnits = items.reduce((s, i) => s + i.dispensedQty, 0);
  const patient = order.visit.patient;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Link
          href="/pharmacy"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Dispensing worklist
        </Link>
        <Button asChild variant="default" size="sm">
          <Link href={`/print/prescription/${order.id}`} target="_blank">
            <Printer className="size-4" /> Print label
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
        {/* ── Live queue rail (POS left) ─────────────────────────────── */}
        <aside className="hidden lg:block">
          <Card className="sticky top-4">
            <CardHeader className="flex-row items-center justify-between gap-2 border-b border-border pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <ClipboardList className="size-4 text-primary" /> Queue
              </CardTitle>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">
                {queue.length}
              </span>
            </CardHeader>
            <CardContent className="max-h-[70vh] overflow-y-auto p-0">
              <ul className="divide-y divide-border">
                {queue.map((o) => {
                  const active = o.id === order.id;
                  return (
                    <li key={o.id}>
                      <Link
                        href={`/pharmacy/${o.id}`}
                        className={cn(
                          "flex items-center gap-2.5 px-3 py-2.5 transition-colors",
                          active ? "bg-accent" : "hover:bg-muted/50",
                        )}
                      >
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-card text-[11px] font-semibold text-foreground ring-1 ring-border">
                          {initials(o.visit.patient.name)}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span
                            className={cn(
                              "block truncate text-sm font-medium",
                              active ? "text-accent-foreground" : "text-foreground",
                            )}
                          >
                            {o.visit.patient.name}
                          </span>
                          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <PriorityPill priority={o.visit.priority} />
                            <span>· {o.items.length} item{o.items.length === 1 ? "" : "s"}</span>
                          </span>
                        </span>
                        <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                          {ageLabel(o.createdAt)}
                        </span>
                      </Link>
                    </li>
                  );
                })}
                {queue.length === 0 && (
                  <li className="px-3 py-6 text-center text-sm text-muted-foreground">Queue is clear</li>
                )}
              </ul>
            </CardContent>
          </Card>
        </aside>

        {/* ── POS register (main) ────────────────────────────────────── */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-accent text-sm font-semibold text-accent-foreground">
                    {initials(patient.name)}
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/patients/${patient.id}`}
                        className="text-lg font-semibold tracking-tight hover:text-primary"
                      >
                        {patient.name}
                      </Link>
                      <StatusBadge state={order.state} />
                      <PriorityPill priority={order.visit.priority} />
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <User className="size-3.5" /> <span className="font-mono">{patient.mrn}</span>
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Stethoscope className="size-3.5" /> {order.prescribedBy?.name ?? "—"}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarClock className="size-3.5" /> {format(order.createdAt, "PP p")}
                      </span>
                      <span className="font-mono text-xs">{order.orderNo}</span>
                    </div>
                  </div>
                </div>

                <div className="w-full max-w-xs sm:w-56">
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Dispensed</span>
                    <span className="font-medium tabular-nums text-foreground">
                      {dispensedUnits}/{totalUnits} units
                    </span>
                  </div>
                  <ProgressBar
                    value={dispensedUnits}
                    max={totalUnits}
                    tone={dispensedUnits >= totalUnits && totalUnits > 0 ? "bg-success" : "bg-primary"}
                  />
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <ListChecks className="size-3.5" /> {items.length} line{items.length === 1 ? "" : "s"} prescribed
                  </div>
                </div>
              </div>

              {order.notes && (
                <>
                  <Separator className="my-4" />
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Prescriber notes: </span>
                    {order.notes}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center gap-2 border-b border-border pb-4">
              <Pill className="size-4 text-primary" />
              <CardTitle>Dispense register</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <DispenseClient orderId={order.id} items={items} canDispense={canDispense} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
