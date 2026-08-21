import Link from "next/link";
import { format } from "date-fns";
import { ClipboardList, ArrowLeft } from "lucide-react";
import type { StockRequestState } from "@prisma/client";
import { requireRole } from "@/server/session";
import { db } from "@/server/db";
import { stockRequestAffordances } from "@/server/services/store";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { NewStockRequestButton, StockRequestActions } from "./requests-client";

export const metadata = { title: "Stock requests" };

const TABS: { value: string; label: string; state?: StockRequestState }[] = [
  { value: "all", label: "All" },
  { value: "submitted", label: "Pending", state: "SUBMITTED" },
  { value: "approved", label: "Approved", state: "APPROVED" },
  { value: "fulfilled", label: "Fulfilled", state: "FULFILLED" },
  { value: "rejected", label: "Rejected", state: "REJECTED" },
];

export default async function StockRequestsPage() {
  const actor = await requireRole("STORE_KEEPER", "MANAGER");

  const requests = await db.stockRequest.findMany({
    include: { requester: { select: { name: true, role: true } } },
    orderBy: { createdAt: "desc" },
  });

  const rows = requests.map((r) => ({
    ...r,
    affordances: stockRequestAffordances(r.state, actor),
  }));

  const counts: Record<string, number> = { all: rows.length };
  for (const r of rows) counts[r.state] = (counts[r.state] ?? 0) + 1;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stock requests"
        description="Consumable requests raised by departments for the store to fulfil."
        icon={ClipboardList}
        actions={
          <>
            <Button variant="ghost" asChild>
              <Link href="/store">
                <ArrowLeft className="size-4" /> Store
              </Link>
            </Button>
            <NewStockRequestButton />
          </>
        }
      />

      <Tabs defaultValue="all">
        <TabsList className="flex-wrap">
          {TABS.map((t) => {
            const count = t.state ? counts[t.state] ?? 0 : counts.all;
            return (
              <TabsTrigger key={t.value} value={t.value}>
                {t.label}
                <span className="ml-1 rounded-full bg-muted-foreground/15 px-1.5 text-xs tabular-nums">{count}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {TABS.map((t) => {
          const filtered = t.state ? rows.filter((r) => r.state === t.state) : rows;
          return (
            <TabsContent key={t.value} value={t.value}>
              <Card>
                <CardContent className="p-0">
                  {filtered.length === 0 ? (
                    <EmptyState
                      title="No requests here"
                      description="Requests in this state will appear here."
                      icon={ClipboardList}
                      className="m-5"
                    />
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item</TableHead>
                          <TableHead>Requested by</TableHead>
                          <TableHead>Reason</TableHead>
                          <TableHead className="text-right">Qty</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filtered.map((r) => (
                          <TableRow key={r.id}>
                            <TableCell className="font-medium">{r.itemName}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {r.requester.name}
                              <span className="block text-xs">{r.requester.role}</span>
                            </TableCell>
                            <TableCell className="max-w-xs truncate text-muted-foreground">{r.reason ?? "—"}</TableCell>
                            <TableCell className="text-right tabular-nums">{r.quantity}</TableCell>
                            <TableCell className="text-muted-foreground">{format(r.createdAt, "dd MMM yyyy")}</TableCell>
                            <TableCell>
                              <StatusBadge state={r.state} />
                            </TableCell>
                            <TableCell className="text-right">
                              <StockRequestActions requestId={r.id} affordances={r.affordances} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
