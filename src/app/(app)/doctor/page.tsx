import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Stethoscope } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { requireRole } from "@/server/session";
import { db } from "@/server/db";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";

export const metadata = { title: "Consultations" };

type VisitRow = Prisma.VisitGetPayload<{ include: { patient: true; doctor: true } }>;

function QueueList({ visits, empty }: { visits: VisitRow[]; empty: string }) {
  if (visits.length === 0) return <EmptyState title={empty} icon={Stethoscope} className="m-4" />;
  return (
    <div className="divide-y divide-border">
      {visits.map((v) => (
        <Link key={v.id} href={`/visits/${v.id}`} className="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-muted/50">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium">{v.patient.name}</span>
              {v.priority !== "ROUTINE" && <StatusBadge state={v.priority} />}
            </div>
            <div className="text-xs text-muted-foreground">
              {v.patient.mrn} · {v.chiefComplaint || "No complaint noted"} · opened {formatDistanceToNow(v.openedAt, { addSuffix: true })}
            </div>
          </div>
          <div className="text-right">
            <StatusBadge state={v.state} />
            <div className="mt-0.5 text-xs text-muted-foreground">{v.doctor?.name ?? "Unassigned"}</div>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default async function DoctorQueuePage() {
  const actor = await requireRole("DOCTOR");
  const mine = actor.role === "DOCTOR" ? actor.id : undefined;

  const [waiting, inConsult, resultsReady] = await Promise.all([
    db.visit.findMany({
      where: { state: "WAITING_FOR_DOCTOR", ...(mine ? { OR: [{ doctorId: mine }, { doctorId: null }] } : {}) },
      include: { patient: true, doctor: true },
      orderBy: [{ priority: "desc" }, { openedAt: "asc" }],
    }),
    db.visit.findMany({
      where: { state: "IN_CONSULTATION", ...(mine ? { doctorId: mine } : {}) },
      include: { patient: true, doctor: true },
      orderBy: { openedAt: "asc" },
    }),
    db.visit.findMany({
      where: { state: "LAB_RESULTS_READY", ...(mine ? { doctorId: mine } : {}) },
      include: { patient: true, doctor: true },
      orderBy: { openedAt: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title="Consultations" description="Your patient queue — pick up waiting patients and review lab results." icon={Stethoscope} />

      <Tabs defaultValue="waiting">
        <TabsList>
          <TabsTrigger value="waiting">Waiting ({waiting.length})</TabsTrigger>
          <TabsTrigger value="consult">In consultation ({inConsult.length})</TabsTrigger>
          <TabsTrigger value="results">Results ready ({resultsReady.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="waiting">
          <Card>
            <CardContent className="p-0">
              <QueueList visits={waiting} empty="No patients waiting" />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="consult">
          <Card>
            <CardContent className="p-0">
              <QueueList visits={inConsult} empty="No active consultations" />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="results">
          <Card>
            <CardContent className="p-0">
              <QueueList visits={resultsReady} empty="No lab results awaiting review" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
