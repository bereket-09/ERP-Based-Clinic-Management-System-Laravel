import Link from "next/link";
import { ArrowLeft, PlusCircle } from "lucide-react";
import { requireRole } from "@/server/session";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NewMedicineForm } from "./new-medicine-form";

export const metadata = { title: "Add medicine" };

export default async function NewMedicationPage() {
  await requireRole("PHARMACIST");
  return (
    <div className="mx-auto max-w-2xl space-y-6">
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
      <Card>
        <CardContent className="p-6">
          <NewMedicineForm />
        </CardContent>
      </Card>
    </div>
  );
}
