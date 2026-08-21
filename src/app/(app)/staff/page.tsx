import Link from "next/link";
import { Users, Mail, Phone } from "lucide-react";
import { Role } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import { requireRole } from "@/server/session";
import { db } from "@/server/db";
import { roleLabel } from "@/lib/rbac";
import { initials } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { StaffFilters } from "./staff-filters";

export const metadata = { title: "Staff directory" };

export default async function StaffDirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string }>;
}) {
  await requireRole("MANAGER", "HR");
  const { q, role } = await searchParams;

  const validRole = role && (Object.values(Role) as string[]).includes(role);
  const where: Prisma.UserWhereInput = {
    ...(validRole ? { role: role as Role } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const staff = await db.user.findMany({
    where,
    include: { department: true },
    orderBy: [{ name: "asc" }],
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff directory"
        description={`${staff.length} staff member${staff.length === 1 ? "" : "s"}`}
        icon={Users}
      />

      <StaffFilters />

      <Card>
        <CardContent className="p-0">
          {staff.length === 0 ? (
            <EmptyState
              title="No staff found"
              description="Try adjusting the search or role filter."
              className="m-5"
              icon={Users}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Contact</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staff.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <Link href={`/staff/${s.id}`} className="flex items-center gap-3 group">
                        <Avatar>
                          {s.photoUrl && <AvatarImage src={s.photoUrl} alt={s.name} />}
                          <AvatarFallback>{initials(s.name)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="font-medium group-hover:text-primary">{s.name}</div>
                          {s.speciality && (
                            <div className="truncate text-xs text-muted-foreground">
                              {s.speciality}
                            </div>
                          )}
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{roleLabel(s.role)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {s.department?.name ?? "—"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge state={s.employmentStatus} />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          <Mail className="size-3.5" /> {s.email}
                        </span>
                        {s.phone && (
                          <span className="inline-flex items-center gap-1.5">
                            <Phone className="size-3.5" /> {s.phone}
                          </span>
                        )}
                      </div>
                    </TableCell>
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
