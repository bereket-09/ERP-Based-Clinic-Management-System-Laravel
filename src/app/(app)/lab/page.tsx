import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { FlaskConical } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { requireRole } from "@/server/session";
import { db } from "@/server/db";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Laboratory" };

type OrderRow = Prisma.LabOrderGetPayload<{
  include: { items: true; visit: { include: { patient: true } } };
}>;

function OrderList({ orders, empty }: { orders: OrderRow[]; empty: string }) {
  if (orders.length === 0) return <EmptyState title={empty} icon={FlaskConical} className="m-4" />;
  return (
    <div className="divide-y divide-border">
      {orders.map((o) => (
        <Link key={o.id} href={`/lab/${o.id}`} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{o.visit.patient.name}</span>
              {o.priority !== "ROUTINE" && <StatusBadge state={o.priority} />}
            </div>
            <div className="text-xs text-muted-foreground">
              <span className="font-mono">{o.orderNo}</span> · {o.items.length} test(s) · {formatDistanceToNow(o.createdAt, { addSuffix: true })}
            </div>
          </div>
          <StatusBadge state={o.state} />
        </Link>
      ))}
    </div>
  );
}

export default async function LabPage() {
  await requireRole("LAB_TECH");

  const [worklist, ready, completed] = await Promise.all([
    db.labOrder.findMany({
      where: { state: { in: ["ORDERED", "COLLECTING", "IN_PROGRESS"] } },
      include: { items: true, visit: { include: { patient: true } } },
      orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
    }),
    db.labOrder.findMany({
      where: { state: "RESULTS_READY" },
      include: { items: true, visit: { include: { patient: true } } },
      orderBy: { updatedAt: "desc" },
    }),
    db.labOrder.findMany({
      where: { state: "COMPLETED" },
      include: { items: true, visit: { include: { patient: true } } },
      orderBy: { updatedAt: "desc" },
      take: 25,
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Laboratory"
        description="Process ordered tests and send results back to the ordering doctor."
        icon={FlaskConical}
        actions={
          <Button asChild variant="outline">
            <Link href="/lab/catalog">Test catalog</Link>
          </Button>
        }
      />

      <Tabs defaultValue="worklist">
        <TabsList>
          <TabsTrigger value="worklist">Worklist ({worklist.length})</TabsTrigger>
          <TabsTrigger value="ready">Sent to doctor ({ready.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completed.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="worklist">
          <Card><CardContent className="p-0"><OrderList orders={worklist} empty="No pending lab orders" /></CardContent></Card>
        </TabsContent>
        <TabsContent value="ready">
          <Card><CardContent className="p-0"><OrderList orders={ready} empty="Nothing awaiting the doctor" /></CardContent></Card>
        </TabsContent>
        <TabsContent value="completed">
          <Card><CardContent className="p-0"><OrderList orders={completed} empty="No completed orders" /></CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
