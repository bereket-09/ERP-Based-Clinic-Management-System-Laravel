import { ClipboardList, Info } from "lucide-react";
import { requireStudent } from "@/server/session";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RequestForm } from "./request-form";

export const metadata = { title: "Request Sick Leave" };

export default async function PortalRequestsPage() {
  await requireStudent();

  return (
    <div className="space-y-6">
      <PageHeader
        icon={ClipboardList}
        title="Request sick leave or records"
        description="Send a request to the clinic reception — for a sick-leave note, a copy of a document, or another record."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>New request</CardTitle>
          </CardHeader>
          <CardContent>
            <RequestForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="size-4 text-primary" /> How it works
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Your request is delivered directly to the clinic reception desk.</p>
            <p>
              A staff member will review it and prepare the relevant document or arrange your
              appointment.
            </p>
            <p>
              Issued documents will appear under <span className="font-medium text-foreground">Documents</span>,
              ready to view and print.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
