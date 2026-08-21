import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, Package, Hash, Tag, ReceiptText, Coins } from "lucide-react";
import { requireRole } from "@/server/session";
import { db } from "@/server/db";
import { birr } from "@/lib/money";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { EditAssetButton } from "../assets-client";
import { AssignAssetButton, ReturnAssetMenu } from "./asset-detail-client";

export const metadata = { title: "Asset" };

export default async function AssetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole("STORE_KEEPER", "MANAGER");
  const { id } = await params;

  const [asset, staff] = await Promise.all([
    db.asset.findUnique({
      where: { id },
      include: {
        assignments: {
          include: { user: { select: { name: true, role: true } } },
          orderBy: { assignedAt: "desc" },
        },
      },
    }),
    db.user.findMany({
      where: { isActive: true, employmentStatus: "ACTIVE" },
      select: { id: true, name: true, role: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!asset) notFound();

  const outstanding = asset.assignments.filter((a) => a.state === "ASSIGNED").length;
  const staffOptions = staff.map((s) => ({ id: s.id, name: s.name, role: s.role }));

  const facts = [
    { icon: Tag, label: "Asset tag", value: asset.tag },
    { icon: Hash, label: "Serial no.", value: asset.serialNo ?? "—" },
    { icon: Package, label: "Category", value: asset.category ?? "—" },
    { icon: Coins, label: "Unit price", value: birr(asset.unitPrice) },
    { icon: ReceiptText, label: "Receipt no.", value: asset.receiptNo ?? "—" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={asset.name}
        description={`${asset.quantity} in stock · ${outstanding} currently assigned`}
        icon={Package}
        actions={
          <>
            <Button variant="ghost" asChild>
              <Link href="/store/assets">
                <ArrowLeft className="size-4" /> Register
              </Link>
            </Button>
            <EditAssetButton
              asset={{
                id: asset.id,
                tag: asset.tag,
                name: asset.name,
                category: asset.category,
                serialNo: asset.serialNo,
                quantity: asset.quantity,
                unitPrice: asset.unitPrice,
                receiptNo: asset.receiptNo,
              }}
            />
            <AssignAssetButton assetId={asset.id} staff={staffOptions} />
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
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
          <CardTitle>Assignment history</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {asset.assignments.length === 0 ? (
            <EmptyState
              title="No assignments yet"
              description="Assign this asset to a staff member to start its loan history."
              icon={Package}
              className="m-5"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Holder</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead>Assigned</TableHead>
                  <TableHead>Returned</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {asset.assignments.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.user.name}</TableCell>
                    <TableCell className="text-muted-foreground">{a.user.role}</TableCell>
                    <TableCell className="text-right tabular-nums">{a.quantity}</TableCell>
                    <TableCell className="text-muted-foreground">{format(a.assignedAt, "dd MMM yyyy")}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {a.returnedAt ? format(a.returnedAt, "dd MMM yyyy") : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <StatusBadge state={a.state} />
                    </TableCell>
                    <TableCell className="text-right">
                      {a.state === "ASSIGNED" && <ReturnAssetMenu assignmentId={a.id} />}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
