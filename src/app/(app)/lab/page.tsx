import Link from "next/link";
import { startOfDay } from "date-fns";
import {
  FlaskConical,
  TestTubes,
  Beaker,
  CheckCircle2,
  Siren,
  BookOpen,
} from "lucide-react";
import { requireRole } from "@/server/session";
import { db } from "@/server/db";
import { PageHeader } from "@/components/page-header";
import { MetricTile } from "@/components/dashboard/metric-tile";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { WorklistTable, type WorklistOrder } from "@/components/lab/worklist-table";

export const metadata = { title: "Laboratory" };

const INCLUDE = {
  items: { include: { test: { select: { specimen: true } } } },
  visit: { include: { patient: true } },
  orderedBy: true,
} as const;

export default async function LabPage() {
  await requireRole("LAB_TECH");
  const todayStart = startOfDay(new Date());

  const [open, ready, completed] = await Promise.all([
    db.labOrder.findMany({
      where: { state: { in: ["ORDERED", "COLLECTING", "IN_PROGRESS"] } },
      include: INCLUDE,
      orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
    }),
    db.labOrder.findMany({
      where: { state: "RESULTS_READY" },
      include: INCLUDE,
      orderBy: { updatedAt: "desc" },
    }),
    db.labOrder.findMany({
      where: { state: "COMPLETED" },
      include: INCLUDE,
      orderBy: { updatedAt: "desc" },
      take: 25,
    }),
  ]);

  const ordered = open.filter((o) => o.state === "ORDERED");
  const collecting = open.filter((o) => o.state === "COLLECTING");
  const processing = open.filter((o) => o.state === "IN_PROGRESS");

  const urgentOpen = open.filter((o) => o.priority !== "ROUTINE").length;
  const readyToday = ready.filter((o) => o.updatedAt >= todayStart).length;

  const tabs: { value: string; label: string; orders: WorklistOrder[]; empty: string; showState?: boolean }[] = [
    { value: "all", label: "All open", orders: open, empty: "No open lab orders" },
    { value: "ordered", label: "Ordered", orders: ordered, empty: "Nothing awaiting collection", showState: false },
    { value: "collecting", label: "Collecting", orders: collecting, empty: "No specimens being collected", showState: false },
    { value: "processing", label: "In progress", orders: processing, empty: "Nothing on the bench", showState: false },
    { value: "ready", label: "Sent to doctor", orders: ready, empty: "Nothing awaiting the doctor", showState: false },
    { value: "completed", label: "Completed", orders: completed, empty: "No completed orders", showState: false },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Laboratory worklist"
        description="Collect specimens, run tests and return verified results to the ordering doctor."
        icon={FlaskConical}
        actions={
          <Button asChild variant="outline">
            <Link href="/lab/catalog">
              <BookOpen className="size-4" /> Test catalog
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricTile
          label="Awaiting collection"
          value={ordered.length}
          icon={TestTubes}
          tone="warning"
        />
        <MetricTile
          label="On the bench"
          value={collecting.length + processing.length}
          hint="Collecting & in progress"
          icon={Beaker}
          tone="info"
        />
        <MetricTile
          label="Results ready today"
          value={readyToday}
          hint={`${ready.length} awaiting review`}
          icon={CheckCircle2}
          tone="success"
        />
        <MetricTile
          label="STAT / urgent"
          value={urgentOpen}
          hint="Open, needs priority"
          icon={Siren}
          tone={urgentOpen > 0 ? "danger" : "brand"}
        />
      </div>

      <Tabs defaultValue="all">
        <TabsList className="flex-wrap">
          {tabs.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
              <span className="ml-1 rounded-full bg-background/60 px-1.5 text-xs font-semibold tabular-nums text-muted-foreground">
                {t.orders.length}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
        {tabs.map((t) => (
          <TabsContent key={t.value} value={t.value}>
            <Card>
              <CardContent className="p-0">
                <WorklistTable orders={t.orders} empty={t.empty} showState={t.showState ?? true} />
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
