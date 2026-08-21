import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, FlaskConical } from "lucide-react";
import { requireRole } from "@/server/session";
import { db } from "@/server/db";
import { labOrderAffordances } from "@/server/services/lab";
import { humanize } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
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

  return (
    <div className="space-y-6">
      <Link href="/lab" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Laboratory
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
              {order.visit.patient.mrn} · Ordered by {order.orderedBy?.name ?? "—"} · {format(order.createdAt, "PP p")}
            </div>
          </div>
          <div className="font-mono text-xs text-muted-foreground">{order.orderNo}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center gap-2">
          <FlaskConical className="size-4 text-primary" />
          <CardTitle>Tests</CardTitle>
          {order.notes && <span className="text-sm text-muted-foreground">· {order.notes}</span>}
        </CardHeader>
        <CardContent>
          <LabOrderClient orderId={order.id} items={order.items} affordances={affordances} editable={editable} />
          {!editable && order.state !== "IN_PROGRESS" && (
            <p className="mt-3 text-xs text-muted-foreground">
              {humanize(order.state)} — advance the order to “In progress” to enter results.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
