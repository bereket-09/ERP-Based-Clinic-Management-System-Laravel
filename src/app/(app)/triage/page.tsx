import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Activity, HeartPulse } from "lucide-react";
import { requireRole } from "@/server/session";
import { db } from "@/server/db";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";

export const metadata = { title: "Triage" };

export default async function TriagePage() {
  await requireRole("NURSE");

  const queue = await db.visit.findMany({
    where: { state: { in: ["REGISTERED", "TRIAGE"] } },
    include: { patient: true, vitals: { orderBy: { createdAt: "desc" }, take: 1 } },
    orderBy: [{ priority: "desc" }, { openedAt: "asc" }],
  });

  const awaiting = queue.filter((v) => v.state === "REGISTERED").length;
  const inTriage = queue.filter((v) => v.state === "TRIAGE").length;

  return (
    <div className="space-y-6">
      <PageHeader title="Nurse triage" description="Capture vitals and route patients to the right doctor." icon={Activity} />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard label="Awaiting triage" value={awaiting} icon={Activity} tone="warning" />
        <StatCard label="In triage" value={inTriage} icon={HeartPulse} tone="info" />
        <StatCard label="Total queue" value={queue.length} icon={Activity} tone="brand" />
      </div>

      <Card>
        <CardContent className="p-0">
          {queue.length === 0 ? (
            <EmptyState title="Triage queue is empty" description="Newly registered patients will appear here." icon={Activity} className="m-5" />
          ) : (
            <div className="divide-y divide-border">
              {queue.map((v) => (
                <Link key={v.id} href={`/visits/${v.id}`} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/50">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{v.patient.name}</span>
                      {v.priority !== "ROUTINE" && <StatusBadge state={v.priority} />}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {v.patient.mrn} · {v.chiefComplaint || "No complaint noted"} · registered {formatDistanceToNow(v.openedAt, { addSuffix: true })}
                    </div>
                  </div>
                  <div className="text-right">
                    <StatusBadge state={v.state} />
                    {v.vitals[0] && <div className="mt-0.5 text-xs text-muted-foreground">Vitals recorded</div>}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
