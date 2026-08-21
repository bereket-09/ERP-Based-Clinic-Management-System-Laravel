import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import {
  ShoppingCart,
  ArrowLeft,
  Truck,
  StickyNote,
  CalendarDays,
  Phone,
  Mail,
  MapPin,
  PackageCheck,
} from "lucide-react";
import { requireRole } from "@/server/session";
import { db } from "@/server/db";
import { birr } from "@/lib/money";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { ProgressBar } from "@/components/store/progress-bar";
import { StoreTimeline } from "@/components/store/store-timeline";
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
      orderBy: { createdAt: "desc" },
    }),
  ]);
  const medName = new Map(meds.map((m) => [m.id, m.name]));

  const totalOrdered = po.items.reduce((s, i) => s + i.quantity, 0);
  const totalReceived = po.items.reduce((s, i) => s + i.received, 0);
  const receivePct = totalOrdered > 0 ? Math.round((totalReceived / totalOrdered) * 100) : 0;
  const isOpen = po.state === "ORDERED" || po.state === "PARTIALLY_RECEIVED";

  const timelineEntries = timeline.map((t) => ({
    id: t.id,
    entityType: t.entityType,
    event: t.event,
    fromState: t.fromState,
    toState: t.toState,
    note: t.note,
    createdAt: t.createdAt,
    actorName: t.actor?.name,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title={po.poNo}
        description={`${po.items.length} line item(s) · raised ${format(po.createdAt, "dd MMM yyyy")}`}
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

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Receipt overview */}
        <Card className="lg:col-span-2">
          <CardContent className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Order total
                </span>
                <div className="mt-1 text-3xl font-semibold tabular-nums tracking-tight text-foreground">
                  {birr(po.total)}
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Received
                </span>
                <div className="mt-1 flex items-baseline justify-end gap-2">
                  <span className="text-3xl font-semibold tabular-nums tracking-tight text-foreground">
                    {receivePct}%
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {totalReceived}/{totalOrdered} units
                  </span>
                </div>
              </div>
            </div>
            <ProgressBar
              value={totalReceived}
              max={totalOrdered}
              tone={receivePct >= 100 ? "success" : receivePct > 0 ? "info" : "warning"}
              className="mt-4"
            />
            <Separator className="my-4" />
            <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Fact icon={CalendarDays} label="Raised" value={format(po.createdAt, "dd MMM yyyy")} />
              <Fact icon={PackageCheck} label="Line items" value={String(po.items.length)} />
              <Fact icon={StickyNote} label="Note" value={po.note ?? "—"} />
            </dl>
          </CardContent>
        </Card>

        {/* Supplier */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="size-4 text-muted-foreground" /> Supplier
            </CardTitle>
          </CardHeader>
          <CardContent>
            {po.supplier ? (
              <div className="space-y-3">
                <p className="font-medium text-foreground">{po.supplier.name}</p>
                <dl className="space-y-2 text-sm">
                  <ContactLine icon={Phone} value={po.supplier.phone} />
                  <ContactLine icon={Mail} value={po.supplier.email} />
                  <ContactLine icon={MapPin} value={po.supplier.address} />
                </dl>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No supplier linked to this order.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Line items</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-5">Item</TableHead>
                <TableHead>Medication</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="w-44">Received</TableHead>
                <TableHead className="text-right">Unit price</TableHead>
                <TableHead className="pr-5 text-right">Line total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {po.items.map((i) => {
                const complete = i.received >= i.quantity;
                return (
                  <TableRow key={i.id}>
                    <TableCell className="pl-5 font-medium">{i.itemName}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {i.medicationId ? medName.get(i.medicationId) ?? "—" : "—"}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{i.quantity}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <ProgressBar
                          value={i.received}
                          max={i.quantity}
                          tone={complete ? "success" : i.received > 0 ? "info" : "warning"}
                          className="w-20"
                        />
                        <Badge variant={complete ? "success" : i.received > 0 ? "info" : "outline"}>
                          {i.received}/{i.quantity}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">{birr(i.unitPrice)}</TableCell>
                    <TableCell className="pr-5 text-right tabular-nums">{birr(i.quantity * i.unitPrice)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <div className="flex items-center justify-end gap-3 border-t border-border px-5 py-3 text-sm">
            <span className="text-muted-foreground">Order total</span>
            <span className="text-lg font-semibold tabular-nums text-foreground">{birr(po.total)}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <StoreTimeline
            entries={timelineEntries}
            emptyDescription="Receipts and status changes for this order will appear here."
          />
        </CardContent>
      </Card>
    </div>
  );
}

function Fact({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <Icon className="size-3.5" /> {label}
      </div>
      <div className="mt-1 truncate font-medium text-foreground">{value}</div>
    </div>
  );
}

function ContactLine({
  icon: Icon,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: string | null;
}) {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <Icon className="size-4 shrink-0" />
      <span className="truncate">{value || "—"}</span>
    </div>
  );
}
