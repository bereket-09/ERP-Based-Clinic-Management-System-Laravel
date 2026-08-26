import Link from "next/link";
import { format } from "date-fns";
import { FileText, Printer } from "lucide-react";
import { requireStudent } from "@/server/session";
import { db } from "@/server/db";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { humanize } from "@/lib/utils";

export const metadata = { title: "Documents" };

export default async function PortalDocumentsPage() {
  const actor = await requireStudent();

  const documents = await db.issuedDocument.findMany({
    where: { patientId: actor.id },
    orderBy: { issuedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="My documents"
        description="Sick-leave notes, prescriptions, referrals and reports issued to you."
      />

      {documents.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No documents yet"
          description="Documents issued by the clinic will appear here, ready to view and print."
        />
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <Card key={doc.id}>
              <CardContent className="flex flex-wrap items-center gap-4 p-5">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                  <FileText className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-foreground">{humanize(doc.type)}</span>
                    <Badge variant="outline" className="font-mono">
                      {doc.docNo}
                    </Badge>
                  </div>
                  <div className="mt-0.5 text-sm text-muted-foreground">
                    Issued {format(doc.issuedAt, "PPP")}
                    {doc.type === "SICK_LEAVE" && doc.fromDate && doc.toDate && (
                      <>
                        {" · "}
                        {format(doc.fromDate, "PP")} – {format(doc.toDate, "PP")}
                        {doc.days ? ` (${doc.days} day${doc.days === 1 ? "" : "s"})` : ""}
                      </>
                    )}
                  </div>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/portal/documents/${doc.id}`}>
                    <Printer className="size-4" /> View / Print
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
