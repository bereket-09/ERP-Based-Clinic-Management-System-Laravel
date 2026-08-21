import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  Send,
  CheckCircle2,
  CircleCheck,
  Siren,
  Share2,
  Plus,
  ArrowUpRight,
} from "lucide-react";
import type { Prisma, ReferralUrgency } from "@prisma/client";
import { requireRole } from "@/server/session";
import { db } from "@/server/db";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { humanize } from "@/lib/utils";

export const metadata = { title: "Referrals" };

type ReferralRow = Prisma.ReferralGetPayload<{
  include: { patient: true; referredBy: true };
}>;

const URGENCY_VARIANT: Record<ReferralUrgency, "default" | "warning" | "danger"> = {
  ROUTINE: "default",
  URGENT: "warning",
  EMERGENCY: "danger",
};

export function UrgencyBadge({ urgency }: { urgency: ReferralUrgency }) {
  if (urgency === "EMERGENCY") {
    return (
      <Badge variant="danger">
        <Siren className="size-3" /> Emergency
      </Badge>
    );
  }
  return <Badge variant={URGENCY_VARIANT[urgency]}>{humanize(urgency)}</Badge>;
}

function ReferralList({ referrals, empty }: { referrals: ReferralRow[]; empty: string }) {
  if (referrals.length === 0) return <EmptyState title={empty} icon={Share2} className="m-4" />;
  return (
    <div className="divide-y divide-border">
      {referrals.map((r) => (
        <Link
          key={r.id}
          href={`/referrals/${r.id}`}
          className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/50"
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="truncate font-medium">{r.patient.name}</span>
              <UrgencyBadge urgency={r.urgency} />
            </div>
            <div className="mt-0.5 truncate text-xs text-muted-foreground">
              <span className="font-mono">{r.referralNo}</span> · {r.toFacility}
              {r.toDepartment ? ` · ${r.toDepartment}` : ""} ·{" "}
              {formatDistanceToNow(r.issuedAt ?? r.createdAt, { addSuffix: true })}
            </div>
          </div>
          <StatusBadge state={r.state} />
        </Link>
      ))}
    </div>
  );
}

export default async function ReferralsPage() {
  await requireRole("DOCTOR", "RECEPTIONIST");

  const include = { patient: true, referredBy: true } as const;

  const [issued, acknowledged, completed, cancelled, urgentCount] = await Promise.all([
    db.referral.findMany({
      where: { state: "ISSUED" },
      include,
      orderBy: [{ urgency: "desc" }, { issuedAt: "desc" }],
    }),
    db.referral.findMany({
      where: { state: "ACKNOWLEDGED" },
      include,
      orderBy: { updatedAt: "desc" },
    }),
    db.referral.findMany({
      where: { state: "COMPLETED" },
      include,
      orderBy: { updatedAt: "desc" },
      take: 25,
    }),
    db.referral.findMany({
      where: { state: { in: ["DRAFT", "CANCELLED"] } },
      include,
      orderBy: { updatedAt: "desc" },
      take: 25,
    }),
    db.referral.count({
      where: {
        urgency: { in: ["URGENT", "EMERGENCY"] },
        state: { in: ["ISSUED", "ACKNOWLEDGED"] },
      },
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Referrals"
        description="Track and manage referrals to external facilities."
        icon={Share2}
        actions={
          <Button asChild variant="primary">
            <Link href="/referrals/new">
              <Plus /> New referral
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Issued" value={issued.length} icon={Send} tone="warning" />
        <StatCard label="Acknowledged" value={acknowledged.length} icon={CheckCircle2} tone="info" />
        <StatCard label="Completed" value={completed.length} icon={CircleCheck} tone="success" />
        <StatCard
          label="Urgent / emergency"
          value={urgentCount}
          icon={Siren}
          tone="danger"
          hint="Open, needing attention"
        />
      </div>

      <Tabs defaultValue="issued">
        <TabsList>
          <TabsTrigger value="issued">Issued ({issued.length})</TabsTrigger>
          <TabsTrigger value="acknowledged">Acknowledged ({acknowledged.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completed.length})</TabsTrigger>
          <TabsTrigger value="other">Draft / cancelled ({cancelled.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="issued">
          <Card>
            <CardContent className="p-0">
              <ReferralList referrals={issued} empty="No issued referrals" />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="acknowledged">
          <Card>
            <CardContent className="p-0">
              <ReferralList referrals={acknowledged} empty="Nothing acknowledged yet" />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="completed">
          <Card>
            <CardContent className="p-0">
              <ReferralList referrals={completed} empty="No completed referrals" />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="other">
          <Card>
            <CardContent className="p-0">
              <ReferralList referrals={cancelled} empty="No draft or cancelled referrals" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <ArrowUpRight className="size-3.5" /> Referrals are also created automatically from the
        doctor consultation &ldquo;refer&rdquo; flow.
      </p>
    </div>
  );
}
