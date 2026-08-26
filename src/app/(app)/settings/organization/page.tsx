import { Building2 } from "lucide-react";
import { requireRole } from "@/server/session";
import { db } from "@/server/db";
import { getBranding } from "@/server/services/settings";
import { humanize } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AddDepartment } from "./add-department";

export const metadata = { title: "Organisation" };

export default async function OrganizationPage() {
  await requireRole("MANAGER");
  const [branding, departments] = await Promise.all([
    getBranding(),
    db.department.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { staff: true, patients: true } } },
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title="Organisation" description="Institution details and departments." icon={Building2} actions={<AddDepartment />} />

      <Card>
        <CardHeader><CardTitle>Institution</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Product name</div>
            <div className="mt-0.5 font-medium">{branding.appName}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Organisation</div>
            <div className="mt-0.5 font-medium">{branding.orgName}</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Departments ({departments.length})</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Staff</TableHead>
                <TableHead>Patients</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departments.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">{d.name}</TableCell>
                  <TableCell><Badge variant="outline">{humanize(d.kind)}</Badge></TableCell>
                  <TableCell className="text-muted-foreground">{d.code ?? "—"}</TableCell>
                  <TableCell>{d._count.staff}</TableCell>
                  <TableCell>{d._count.patients}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
