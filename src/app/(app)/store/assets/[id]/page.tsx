import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, Package, Hash, Tag, ReceiptText, Coins, Boxes, UserCheck } from "lucide-react";
import { requireRole } from "@/server/session";
import { db } from "@/server/db";
import { birr } from "@/lib/money";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { ProgressBar } from "@/components/store/progress-bar";
import { EditAssetButton } from "../assets-client";
import { AssignAssetButton, ReturnAssetMenu } from "./asset-detail-client";

export const metadata = { title: "Asset" };

const LOW_AVAILABILITY = 2;

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

  const assignedQty = asset.assignments
    .filter((a) => a.state === "ASSIGNED")
    .reduce((s, a) => s + a.quantity, 0);
  const available = asset.quantity - assignedQty;
  const outstanding = asset.assignments.filter((a) => a.state === "ASSIGNED").length;
  const returnedCount = asset.assignments.filter((a) => a.state === "RETURNED").length;
  const lostCount = asset.assignments.filter((a) => a.state === "LOST").length;
  const damagedCount = asset.assignments.filter((a) => a.state === "DAMAGED").length;
  const staffOptions = staff.map((s) => ({ id: s.id, name: s.name, role: s.role }));

  const status =
    asset.quantity === 0
      ? { label: "Empty", variant: "danger" as const }
      : available <= 0
        ? { label: "Fully deployed", variant: "info" as const }
        : available <= LOW_AVAILABILITY
          ? { label: "Low availability", variant: "warning" as const }
          : { label: "In stock", variant: "success" as const };

  const facts = [
    { icon: Tag, label: "Asset tag", value: asset.tag },
    { icon: Hash, label: "Serial no.", value: asset.serialNo ?? "—" },
    { icon: Package, label: "Category", value: asset.category ?? "—" },
    { icon: Coins, label: "Unit price", value: birr(asset.unitPrice) },
    { icon: ReceiptText, label: "Receipt no.", value: asset.receiptNo ?? "—" },
  ];

  const activeAssignments = asset.assignments.filter((a) => a.state === "ASSIGNED");

  return (
    <div className="space-y-6">
      <PageHeader
        title={asset.name}
        description={`${asset.tag} · ${asset.category ?? "Uncategorised"}`}
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

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Availability overview */}
        <Card className="lg:col-span-1">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Availability
              </span>
              <Badge variant={status.variant}>{status.label}</Badge>
            </div>
            <div className="mt-3 flex items-end gap-2">
              <span className="text-4xl font-semibold tabular-nums leading-none tracking-tight text-foreground">
                {available}
              </span>
              <span className="pb-1 text-sm text-muted-foreground">of {asset.quantity} free</span>
            </div>
            <ProgressBar
              value={available}
              max={asset.quantity}
              tone={available <= LOW_AVAILABILITY ? "warning" : "success"}
              className="mt-3"
            />
            <dl className="mt-4 grid grid-cols-2 gap-3">
              <MiniStat icon={UserCheck} label="On loan" value={assignedQty} />
              <MiniStat icon={Boxes} label="Total units" value={asset.quantity} />
              <MiniStat icon={Coins} label="Unit price" value={birr(asset.unitPrice)} />
              <MiniStat icon={Coins} label="Total value" value={birr(asset.quantity * asset.unitPrice)} />
            </dl>
          </CardContent>
        </Card>

        {/* Facts */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {facts.map((f) => (
              <div key={f.label} className="rounded-xl bg-muted/50 p-3">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <f.icon className="size-3.5" /> {f.label}
                </div>
                <div className="mt-1.5 truncate font-medium text-foreground">{f.value}</div>
              </div>
            ))}
            <div className="rounded-xl bg-muted/50 p-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Lifecycle
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Badge variant="info">{outstanding} out</Badge>
                <Badge variant="success">{returnedCount} returned</Badge>
                {damagedCount > 0 && <Badge variant="warning">{damagedCount} damaged</Badge>}
                {lostCount > 0 && <Badge variant="danger">{lostCount} lost</Badge>}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Currently on loan */}
      {activeAssignments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Currently on loan</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-5">Holder</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead>Since</TableHead>
                  <TableHead className="pr-5 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeAssignments.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="pl-5 font-medium">{a.user.name}</TableCell>
                    <TableCell className="text-muted-foreground">{a.user.role}</TableCell>
                    <TableCell className="text-right tabular-nums">{a.quantity}</TableCell>
                    <TableCell className="text-muted-foreground">{format(a.assignedAt, "dd MMM yyyy")}</TableCell>
                    <TableCell className="pr-5 text-right">
                      <ReturnAssetMenu assignmentId={a.id} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Full history */}
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
                  <TableHead className="pl-5">Holder</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead>Assigned</TableHead>
                  <TableHead>Returned</TableHead>
                  <TableHead className="pr-5 text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {asset.assignments.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="pl-5 font-medium">{a.user.name}</TableCell>
                    <TableCell className="text-muted-foreground">{a.user.role}</TableCell>
                    <TableCell className="text-right tabular-nums">{a.quantity}</TableCell>
                    <TableCell className="text-muted-foreground">{format(a.assignedAt, "dd MMM yyyy")}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {a.returnedAt ? format(a.returnedAt, "dd MMM yyyy") : "—"}
                    </TableCell>
                    <TableCell className="pr-5 text-right">
                      <StatusBadge state={a.state} />
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

function MiniStat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-muted/60 px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="size-3.5" /> {label}
      </div>
      <div className="mt-0.5 text-lg font-semibold tabular-nums tracking-tight text-foreground">{value}</div>
    </div>
  );
}
