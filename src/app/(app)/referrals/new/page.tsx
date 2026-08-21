import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireRole } from "@/server/session";
import { db } from "@/server/db";
import { PageHeader } from "@/components/page-header";
import { ReferralForm } from "./referral-form";

export const metadata = { title: "New referral" };

export default async function NewReferralPage() {
  await requireRole("DOCTOR", "RECEPTIONIST");

  const patients = await db.patient.findMany({
    orderBy: { updatedAt: "desc" },
    take: 50,
    select: { id: true, name: true, mrn: true },
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href="/referrals"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Referrals
      </Link>

      <PageHeader
        title="New referral"
        description="Issue a referral to an external facility."
      />

      <ReferralForm patients={patients} />
    </div>
  );
}
