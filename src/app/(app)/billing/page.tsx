import Link from "next/link";
import { startOfDay } from "date-fns";
import { Receipt, Wallet, CircleDollarSign, HandCoins, FileClock, FilePlus2 } from "lucide-react";
import type { Prisma, InvoiceState } from "@prisma/client";
import { requireRole } from "@/server/session";
import { db } from "@/server/db";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatETB } from "@/lib/money";
import { generateInvoiceAction } from "./actions";

export const metadata = { title: "Billing" };

type InvoiceRow = Prisma.InvoiceGetPayload<{ include: { patient: true } }>;

const TABS: { value: string; label: string; states: InvoiceState[] | null }[] = [
  { value: "all", label: "All", states: null },
  { value: "issued", label: "Issued", states: ["ISSUED"] },
  { value: "partial", label: "Partially paid", states: ["PARTIALLY_PAID"] },
  { value: "paid", label: "Paid", states: ["PAID"] },
  { value: "draft", label: "Draft", states: ["DRAFT"] },
  { value: "void", label: "Void", states: ["VOID"] },
];

function InvoiceTable({ rows }: { rows: InvoiceRow[] }) {
  if (rows.length === 0) {
    return <EmptyState title="No invoices here" icon={Receipt} className="m-4" />;
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead>Patient</TableHead>
          <TableHead className="text-right">Total</TableHead>
          <TableHead className="text-right">Paid</TableHead>
          <TableHead className="text-right">Balance</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((inv) => {
          const balance = inv.total - inv.paid;
          return (
            <TableRow key={inv.id} className="cursor-pointer">
              <TableCell className="font-mono text-xs">
                <Link href={`/billing/${inv.id}`} className="hover:text-primary">
                  {inv.invoiceNo}
                </Link>
              </TableCell>
              <TableCell>
                <Link href={`/billing/${inv.id}`} className="font-medium hover:text-primary">
                  {inv.patient.name}
                </Link>
                <div className="text-xs text-muted-foreground">{inv.patient.mrn}</div>
              </TableCell>
              <TableCell className="text-right tabular-nums">{formatETB(inv.total)}</TableCell>
              <TableCell className="text-right tabular-nums text-success">{formatETB(inv.paid)}</TableCell>
              <TableCell className="text-right tabular-nums font-medium">
                {formatETB(balance)}
              </TableCell>
              <TableCell>
                <StatusBadge state={inv.state} />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

export default async function BillingPage() {
  await requireRole("RECEPTIONIST", "MANAGER");

  const [invoices, toBill, agg] = await Promise.all([
    db.invoice.findMany({ include: { patient: true }, orderBy: { createdAt: "desc" } }),
    db.visit.findMany({
      where: { state: "COMPLETED", invoices: { none: {} } },
      include: { patient: true },
      orderBy: { closedAt: "desc" },
      take: 12,
    }),
    db.invoice.aggregate({
      where: { state: { not: "VOID" } },
      _sum: { total: true, paid: true },
    }),
  ]);

  const totalBilled = agg._sum.total ?? 0;
  const collected = agg._sum.paid ?? 0;
  const outstanding = invoices
    .filter((i) => i.state === "ISSUED" || i.state === "PARTIALLY_PAID")
    .reduce((s, i) => s + (i.total - i.paid), 0);
  const todayStart = startOfDay(new Date());
  const invoicesToday = invoices.filter((i) => i.createdAt >= todayStart).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing & cashier"
        description="Raise invoices, collect payments and print receipts."
        icon={Receipt}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total billed (ETB)" value={formatETB(totalBilled)} icon={CircleDollarSign} tone="brand" />
        <StatCard label="Collected (ETB)" value={formatETB(collected)} icon={Wallet} tone="success" />
        <StatCard
          label="Outstanding (ETB)"
          value={formatETB(outstanding)}
          icon={HandCoins}
          tone={outstanding > 0 ? "warning" : "success"}
        />
        <StatCard label="Invoices today" value={invoicesToday} icon={FileClock} tone="info" />
      </div>

      {toBill.length > 0 && (
        <Card>
          <CardHeader className="flex-row items-center gap-2">
            <FilePlus2 className="size-4 text-primary" />
            <CardTitle>Completed visits ready to bill</CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border p-0">
            {toBill.map((v) => (
              <div key={v.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div>
                  <Link href={`/patients/${v.patientId}`} className="font-medium hover:text-primary">
                    {v.patient.name}
                  </Link>
                  <div className="text-xs text-muted-foreground">
                    <span className="font-mono">{v.visitNo}</span> · {v.patient.mrn}
                  </div>
                </div>
                <form action={generateInvoiceAction.bind(null, v.id)}>
                  <Button type="submit" variant="primary" size="sm">
                    <FilePlus2 className="size-4" /> Generate invoice
                  </Button>
                </form>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="all">
        <TabsList className="flex-wrap">
          {TABS.map((t) => {
            const count = t.states
              ? invoices.filter((i) => t.states!.includes(i.state)).length
              : invoices.length;
            return (
              <TabsTrigger key={t.value} value={t.value}>
                {t.label} ({count})
              </TabsTrigger>
            );
          })}
        </TabsList>
        {TABS.map((t) => {
          const rows = t.states ? invoices.filter((i) => t.states!.includes(i.state)) : invoices;
          return (
            <TabsContent key={t.value} value={t.value}>
              <Card>
                <CardContent className="p-0">
                  <InvoiceTable rows={rows} />
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
