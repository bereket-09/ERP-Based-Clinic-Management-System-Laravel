import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, Pill } from "lucide-react";
import { requireRole } from "@/server/session";
import { db } from "@/server/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { DispenseClient } from "./dispense-client";

export default async function DrugOrderPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole("PHARMACIST");
  const { id } = await params;

  const order = await db.drugOrder.findUnique({
    where: { id },
    include: {
      items: { include: { medication: { include: { batches: true } } } },
      prescribedBy: true,
      visit: { include: { patient: true } },
    },
  });
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
    stock: it.medication.batches.reduce((s, b) => s + b.quantity, 0),
    medication: { name: it.medication.name, strength: it.medication.strength, form: it.medication.form },
  }));

  const canDispense = ["ORDERED", "PARTIALLY_DISPENSED"].includes(order.state);

  return (
    <div className="space-y-6">
      <Link href="/pharmacy" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Pharmacy
      </Link>

      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div>
            <div className="flex items-center gap-2">
              <Link href={`/patients/${order.visit.patientId}`} className="text-lg font-semibold hover:text-primary">
                {order.visit.patient.name}
              </Link>
              <StatusBadge state={order.state} />
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              {order.visit.patient.mrn} · Prescribed by {order.prescribedBy?.name ?? "—"} · {format(order.createdAt, "PP p")}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href={`/print/prescription/${order.id}`} className="text-sm text-primary hover:underline" target="_blank">
              Print
            </Link>
            <span className="font-mono text-xs text-muted-foreground">{order.orderNo}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center gap-2">
          <Pill className="size-4 text-primary" />
          <CardTitle>Prescription</CardTitle>
        </CardHeader>
        <CardContent>
          <DispenseClient orderId={order.id} items={items} canDispense={canDispense} />
        </CardContent>
      </Card>
    </div>
  );
}
