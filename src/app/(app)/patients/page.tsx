import Link from "next/link";
import { Search, Users, UserPlus } from "lucide-react";
import { requireStaff } from "@/server/session";
import { findPatients } from "@/server/services/patient";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/empty-state";

export const metadata = { title: "Patients" };

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireStaff();
  const { q } = await searchParams;
  const patients = await findPatients(q);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Patients"
        description="Search the clinic record by name, MRN, or student ID."
        icon={Users}
        actions={
          <Button asChild variant="primary">
            <Link href="/reception">
              <UserPlus className="size-4" /> Register patient
            </Link>
          </Button>
        }
      />

      <form className="flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input name="q" defaultValue={q} placeholder="Search patients…" className="pl-9" />
        </div>
        <Button type="submit">Search</Button>
      </form>

      <Card>
        <CardContent className="p-0">
          {patients.length === 0 ? (
            <EmptyState
              title={q ? "No matching patients" : "No patients yet"}
              description={q ? "Try a different name or ID." : "Register the first patient from reception."}
              icon={Users}
              className="m-5"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>MRN</TableHead>
                  <TableHead>Student ID</TableHead>
                  <TableHead>College</TableHead>
                  <TableHead>Phone</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <Link href={`/patients/${p.id}`} className="font-medium hover:text-primary">
                        {p.name}
                      </Link>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{p.mrn}</TableCell>
                    <TableCell className="text-muted-foreground">{p.studentId ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{p.college ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{p.phone ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
