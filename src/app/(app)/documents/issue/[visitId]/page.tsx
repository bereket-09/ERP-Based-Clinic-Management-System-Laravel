import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText, ArrowLeft } from "lucide-react";
import { requireRole } from "@/server/session";
import { db } from "@/server/db";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { SickLeaveForm } from "./sick-leave-form";

export default async function IssueSickLeavePage({
  params,
}: {
  params: Promise<{ visitId: string }>;
}) {
  await requireRole("DOCTOR");
  const { visitId } = await params;

  const visit = await db.visit.findUnique({
    where: { id: visitId },
    include: { patient: true },
  });
  if (!visit) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Issue sick leave"
        description={`${visit.patient.name} · Visit ${visit.visitNo}`}
        icon={FileText}
        actions={
          <Button asChild variant="ghost" size="sm">
            <Link href={`/visits/${visit.id}`}>
              <ArrowLeft /> Back to visit
            </Link>
          </Button>
        }
      />
      <SickLeaveForm visitId={visit.id} defaultDiagnosis={visit.diagnosis} />
    </div>
  );
}
