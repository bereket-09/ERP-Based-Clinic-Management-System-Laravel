import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ShoppingCart, ArrowLeft, Truck, StickyNote, CalendarDays } from "lucide-react";
import { requireRole } from "@/server/session";
import { db } from "@/server/db";
import { birr } from "@/lib/money";
import { humanize } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { PurchaseOrderActions } from "./receive-client";

export const metadata = { title: "Purchase order" };

export default async function PurchaseOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole("STORE_KEEPER", "MANAGER");
  const { id } = await params;

  const po = await db.purchaseOrder.findUnique({
    where: { id },
    include: {
      supplier: true,
      items: { orderBy: { itemName: "asc" } },
    },
  });
  if (!po) notFound();

  const medIds = [...new Set(po.items.map((i) => i.medicationId).filter((v): v is string => !!v))];
  const [meds, timeline] = await Promise.all([
    medIds.length > 0
      ? db.medication.findMany({ where: { id: { in: medIds } }, select: { id: true, name: true } })
      : Promise.resolve([]),
    db.stateTransition.findMany({
      where: { entityType: "PurchaseOrder", entityId: id },
      include: { actor: { select: { name: true } } },
      orderBy: { createdAt: "asc" },
    }),
  ]);
  const medName = new Map(meds.map((m) => [m.id, m.name]));

  const totalOrdered = po.items.reduce((s, i) => s + i.quantity, 0);
  const totalReceived = po.items.reduce((s, i) => s + i.received, 0);
  const receivePct = totalOrdered > 0 ? Math.round((totalReceived / totalOrdered) * 100) : 0;
  const isOpen = po.state === "ORDERED" || po.state === "PARTIALLY_RECEIVED";

  const facts = [
    { icon: Truck, label: "Supplier", value: po.supplier?.name ?? "—" },
    { icon: CalendarDays, label: "Raised", value: format(po.createdAt, "dd MMM yyyy") },
    { icon: ShoppingCart, label: "Order total", value: birr(po.total) },
    { icon: StickyNote, label: "Note", value: po.note ?? "—" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={po.poNo}
        description={`${po.items.length} line item(s) · ${receivePct}% received`}
        icon={ShoppingCart}
        actions={
          <>
            <Button variant="ghost" asChild>
              <Link href="/store/purchase-orders">
                <ArrowLeft className="size-4" /> Orders
              </Link>
            </Button>
            <StatusBadge state={po.state} className="self-center" />
            <PurchaseOrderActions
              poId={po.id}
              items={po.items.map((i) => ({ id: i.id, itemName: i.itemName, quantity: i.quantity, received: i.received }))}
              canReceive={isOpen}
              canCancel={isOpen}
            />
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {facts.map((f) => (
          <Card key={f.label} className="p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <f.icon className="size-3.5" /> {f.label}
            </div>
            <div className="mt-1.5 truncate font-medium text-foreground">{f.value}</div>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Line items</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Medication</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Received</TableHead>
                <TableHead className="text-right">Unit price</TableHead>
                <TableHead className="text-right">Line total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {po.items.map((i) => {
                const complete = i.received >= i.quantity;
                return (
                  <TableRow key={i.id}>
                    <TableCell className="font-medium">{i.itemName}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {i.medicationId ? medName.get(i.medicationId) ?? "—" : "—"}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{i.quantity}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={complete ? "success" : i.received > 0 ? "info" : "outline"}>
                        {i.received} / {i.quantity}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">{birr(i.unitPrice)}</TableCell>
                    <TableCell className="text-right tabular-nums">{birr(i.quantity * i.unitPrice)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <div className="flex items-center justify-end gap-3 border-t border-border px-4 py-3 text-sm">
            <span className="text-muted-foreground">Order total</span>
            <span className="text-lg font-semibold text-foreground">{birr(po.total)}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {timeline.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity recorded yet.</p>
          ) : (
            <ol className="space-y-3">
              {timeline.map((t) => (
                <li key={t.id} className="flex items-start gap-3 text-sm">
                  <span className="mt-1 size-2 shrink-0 rounded-full bg-primary" />
                  <div>
                    <p className="text-foreground">
                      <span className="font-medium">{humanize(t.event)}</span>
                      {t.fromState !== "—" && (
                        <span className="text-muted-foreground">
                          {" "}
                          · {humanize(t.fromState)} → {humanize(t.toState)}
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t.actor?.name ?? "System"} · {format(t.createdAt, "dd MMM yyyy, HH:mm")}
                      {t.note ? ` · ${t.note}` : ""}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
