import Link from "next/link";
import { ArrowLeft, PlusCircle, Info, PackagePlus, Bell } from "lucide-react";
import { requireRole } from "@/server/session";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NewMedicineForm } from "./new-medicine-form";

export const metadata = { title: "Add medicine" };

const TIPS = [
  {
    icon: Info,
    title: "Formulary, not stock",
    body: "This registers the medicine itself. On-hand quantity comes from receiving stock batches afterwards.",
  },
  {
    icon: PackagePlus,
    title: "Receive stock next",
    body: "Once created, open the medicine and “Receive stock” to add a batch with its expiry and prices.",
  },
  {
    icon: Bell,
    title: "Reorder alerts",
    body: "Set a realistic reorder level — the station flags the medicine the moment on-hand stock drops to it.",
  },
];

export default async function NewMedicationPage() {
  await requireRole("PHARMACIST");
  return (
    <div className="space-y-6">
      <PageHeader
        title="Add medicine"
        description="Register a new medication in the clinic formulary."
        icon={PlusCircle}
        actions={
          <Button variant="ghost" asChild>
            <Link href="/pharmacy/inventory">
              <ArrowLeft className="size-4" /> Back to inventory
            </Link>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="flex items-center gap-2">
              <PlusCircle className="size-4 text-primary" /> Medicine details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <NewMedicineForm />
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Before you save</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {TIPS.map((t) => (
              <div key={t.title} className="flex gap-3">
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <t.icon className="size-4" />
                </span>
                <div>
                  <div className="text-sm font-medium text-foreground">{t.title}</div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{t.body}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
