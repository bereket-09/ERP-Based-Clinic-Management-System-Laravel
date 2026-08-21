import Link from "next/link";
import { ArrowLeft, CalendarPlus } from "lucide-react";
import { requireRole } from "@/server/session";
import { db } from "@/server/db";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookForm } from "./book-form";

export const metadata = { title: "Book appointment" };

export default async function NewAppointmentPage({
  searchParams,
}: {
  searchParams: Promise<{ provider?: string }>;
}) {
  await requireRole("RECEPTIONIST", "DOCTOR", "NURSE");
  const { provider } = await searchParams;

  const [patients, providers] = await Promise.all([
    db.patient.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      select: { id: true, name: true, mrn: true, studentId: true },
    }),
    db.user.findMany({
      where: { role: "DOCTOR", isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <Link
        href="/appointments"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to agenda
      </Link>

      <PageHeader
        title="Book appointment"
        description="Schedule a patient with a provider."
        icon={CalendarPlus}
      />

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Appointment details</CardTitle>
          </CardHeader>
          <CardContent>
            <BookForm patients={patients} providers={providers} defaultProviderId={provider} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
