import Link from "next/link";
import { format, startOfDay } from "date-fns";
import { UserPlus, UserCheck, Clock, Activity } from "lucide-react";
import { requireRole } from "@/server/session";
import { db } from "@/server/db";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { ReceptionConsole } from "./reception-console";

export const metadata = { title: "Reception" };

export default async function ReceptionPage() {
  await requireRole("RECEPTIONIST");

  const dayStart = startOfDay(new Date());

  const [doctors, recent, todayCount, waitingCount, activeCount] = await Promise.all([
    db.user.findMany({ where: { role: "DOCTOR", isActive: true }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    db.visit.findMany({
      where: { state: { notIn: ["COMPLETED", "CANCELLED"] } },
      include: { patient: true, doctor: true },
      orderBy: { openedAt: "desc" },
      take: 10,
    }),
    db.patient.count({ where: { createdAt: { gte: dayStart } } }),
    db.visit.count({ where: { state: "WAITING_FOR_DOCTOR" } }),
    db.visit.count({ where: { state: { notIn: ["COMPLETED", "CANCELLED"] } } }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title="Reception" description="Register students, look them up in SIMS, and start visits." icon={UserPlus} />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Registered today" value={todayCount} icon={UserCheck} tone="brand" />
        <StatCard label="Waiting for a doctor" value={waitingCount} icon={Clock} tone="warning" />
        <StatCard label="Active visits" value={activeCount} icon={Activity} tone="info" href="/patients" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ReceptionConsole doctors={doctors} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Today’s queue</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recent.length === 0 ? (
              <EmptyState title="No active visits" icon={UserPlus} />
            ) : (
              recent.map((v) => (
                <Link
                  key={v.id}
                  href={`/patients/${v.patientId}`}
                  className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 hover:border-primary hover:bg-accent"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{v.patient.name}</div>
                    <div className="text-xs text-muted-foreground">
                      <span className="font-mono tabular-nums">{v.patient.mrn}</span> · {format(v.openedAt, "p")} ·{" "}
                      {v.doctor?.name ?? "Unassigned"}
                    </div>
                  </div>
                  <StatusBadge state={v.state} />
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
