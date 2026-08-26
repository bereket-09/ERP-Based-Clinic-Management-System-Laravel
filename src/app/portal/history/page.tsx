import { format } from "date-fns";
import { Stethoscope } from "lucide-react";
import { requireStudent } from "@/server/session";
import { db } from "@/server/db";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { VisitCard, type VisitView } from "./visit-card";

export const metadata = { title: "My Visits" };

export default async function PortalHistoryPage() {
  const actor = await requireStudent();

  const visits = await db.visit.findMany({
    where: { patientId: actor.id },
    orderBy: { openedAt: "desc" },
    include: {
      doctor: true,
      labOrders: { include: { items: { include: { test: true } } } },
      drugOrders: { include: { items: { include: { medication: true } } } },
    },
  });

  const views: VisitView[] = visits.map((v) => ({
    id: v.id,
    visitNo: v.visitNo,
    state: v.state,
    date: format(v.openedAt, "PPP"),
    doctor: v.doctor?.name ?? null,
    chiefComplaint: v.chiefComplaint,
    diagnosis: v.diagnosis,
    disease: v.disease,
    labs: v.labOrders.flatMap((o) =>
      o.items.map((it) => ({
        id: it.id,
        name: it.test.name,
        resultValue: it.resultValue,
        resultFlag: it.resultFlag,
      })),
    ),
    drugs: v.drugOrders.flatMap((o) =>
      o.items.map((it) => ({
        id: it.id,
        name: it.medication.name,
        dose: it.dose,
        frequency: it.frequency,
        duration: it.duration,
      })),
    ),
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="My visit history"
        description="A complete, read-only record of every clinic encounter."
      />

      {views.length === 0 ? (
        <EmptyState
          icon={Stethoscope}
          title="No visits recorded yet"
          description="Once you visit the clinic, your encounters will appear here."
        />
      ) : (
        <div className="space-y-4">
          {views.map((v) => (
            <VisitCard key={v.id} visit={v} />
          ))}
        </div>
      )}
    </div>
  );
}
