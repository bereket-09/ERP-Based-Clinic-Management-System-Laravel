import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import {
  ArrowLeft,
  Share2,
  Printer,
  Building2,
  Stethoscope,
  Siren,
  FileText,
  Activity,
} from "lucide-react";
import type { ReferralUrgency } from "@prisma/client";
import { requireRole } from "@/server/session";
import { db } from "@/server/db";
import { referralAffordances } from "@/server/services/referral";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { humanize } from "@/lib/utils";
import { ReferralActions } from "./referral-actions";

function UrgencyBadge({ urgency }: { urgency: ReferralUrgency }) {
  if (urgency === "EMERGENCY") {
    return (
      <Badge variant="danger">
        <Siren className="size-3" /> Emergency
      </Badge>
    );
  }
  return (
    <Badge variant={urgency === "URGENT" ? "warning" : "default"}>{humanize(urgency)}</Badge>
  );
}

function Field({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value?: string | null;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {Icon && <Icon className="size-3.5" />}
        {label}
      </div>
      <div className="mt-1 whitespace-pre-wrap text-sm text-foreground">{value?.trim() || "—"}</div>
    </div>
  );
}

export default async function ReferralDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const actor = await requireRole("DOCTOR", "RECEPTIONIST");
  const { id } = await params;

  const referral = await db.referral.findUnique({
    where: { id },
    include: {
      patient: true,
      referredBy: true,
      visit: true,
    },
  });
  if (!referral) notFound();

  const affordances = referralAffordances(referral.state, actor);
  const { patient } = referral;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/referrals"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Referrals
        </Link>
        <Button asChild variant="outline">
          <Link href={`/print/referral/${referral.id}`} target="_blank">
            <Printer /> Print referral letter
          </Link>
        </Button>
      </div>

      {/* Patient banner */}
      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div>
            <div className="flex items-center gap-2">
              <Link
                href={`/patients/${patient.id}`}
                className="text-lg font-semibold hover:text-primary"
              >
                {patient.name}
              </Link>
              <StatusBadge state={referral.state} />
              <UrgencyBadge urgency={referral.urgency} />
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              {patient.mrn}
              {patient.studentId ? ` · ${patient.studentId}` : ""} · Referred by{" "}
              {referral.referredBy?.name ?? "—"}
              {referral.issuedAt ? ` · Issued ${format(referral.issuedAt, "PP p")}` : ""}
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono text-xs text-muted-foreground">{referral.referralNo}</div>
            {referral.visitId && (
              <Link
                href={`/visits/${referral.visitId}`}
                className="text-xs text-primary hover:underline"
              >
                From visit
              </Link>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader className="flex-row items-center gap-2">
              <Share2 className="size-4 text-primary" />
              <CardTitle>Referral</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-5 sm:grid-cols-2">
              <Field label="Destination facility" value={referral.toFacility} icon={Building2} />
              <Field label="Department" value={referral.toDepartment} icon={Stethoscope} />
              <div className="sm:col-span-2">
                <Field label="Reason for referral" value={referral.reason} icon={FileText} />
              </div>
              <div className="sm:col-span-2">
                <Field
                  label="Clinical summary"
                  value={referral.clinicalSummary}
                  icon={Activity}
                />
              </div>
              <div className="sm:col-span-2">
                <Field label="Investigations" value={referral.investigations} />
              </div>
              <div className="sm:col-span-2">
                <Field label="Treatment given" value={referral.treatmentGiven} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action rail */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ReferralActions referralId={referral.id} affordances={affordances} />
              <div className="space-y-2 border-t border-border pt-4 text-xs text-muted-foreground">
                <div className="flex justify-between gap-2">
                  <span>Created</span>
                  <span>{format(referral.createdAt, "PP p")}</span>
                </div>
                {referral.issuedAt && (
                  <div className="flex justify-between gap-2">
                    <span>Issued</span>
                    <span>{format(referral.issuedAt, "PP p")}</span>
                  </div>
                )}
                <div className="flex justify-between gap-2">
                  <span>Last updated</span>
                  <span>{format(referral.updatedAt, "PP p")}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
