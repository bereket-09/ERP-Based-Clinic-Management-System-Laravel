import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  GraduationCap,
  Briefcase,
  CalendarClock,
  Mail,
  Phone,
  MapPin,
  Building2,
} from "lucide-react";
import { requireRole } from "@/server/session";
import { db } from "@/server/db";
import { roleLabel } from "@/lib/rbac";
import { initials, humanize } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export const metadata = { title: "Staff profile" };

function year(d: Date | null | undefined) {
  return d ? d.getFullYear().toString() : null;
}

function range(start: Date | null | undefined, end: Date | null | undefined) {
  const s = year(start);
  const e = year(end);
  if (!s && !e) return null;
  return `${s ?? "—"} – ${e ?? "Present"}`;
}

export default async function StaffProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("MANAGER", "HR");
  const { id } = await params;

  const staff = await db.user.findUnique({
    where: { id },
    include: {
      department: true,
      education: { orderBy: { startDate: "desc" } },
      experience: { orderBy: { startDate: "desc" } },
      leaveRequests: { orderBy: { createdAt: "desc" }, take: 8 },
    },
  });

  if (!staff) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff profile"
        actions={
          <Button asChild variant="ghost" size="sm">
            <Link href="/staff">
              <ArrowLeft className="size-4" /> Back to directory
            </Link>
          </Button>
        }
      />

      <Card>
        <CardContent className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
          <Avatar className="size-16 text-lg">
            {staff.photoUrl && <AvatarImage src={staff.photoUrl} alt={staff.name} />}
            <AvatarFallback>{initials(staff.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-semibold tracking-tight">{staff.name}</h2>
              <StatusBadge state={staff.employmentStatus} />
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {roleLabel(staff.role)}
              {staff.speciality ? ` · ${staff.speciality}` : ""}
            </p>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Mail className="size-4" /> {staff.email}
              </span>
              {staff.phone && (
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="size-4" /> {staff.phone}
                </span>
              )}
              {staff.department && (
                <span className="inline-flex items-center gap-1.5">
                  <Building2 className="size-4" /> {staff.department.name}
                </span>
              )}
              {staff.address && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-4" /> {staff.address}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="size-4 text-muted-foreground" /> Education
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {staff.education.length === 0 ? (
              <p className="text-sm text-muted-foreground">No education records.</p>
            ) : (
              staff.education.map((ed, i) => (
                <div key={ed.id}>
                  {i > 0 && <Separator className="mb-3" />}
                  <div className="font-medium">{ed.institution}</div>
                  <div className="text-sm text-muted-foreground">
                    {[ed.level, ed.field].filter(Boolean).join(" · ") || "—"}
                  </div>
                  {range(ed.startDate, ed.endDate) && (
                    <div className="mt-0.5 text-xs text-muted-foreground/80">
                      {range(ed.startDate, ed.endDate)}
                    </div>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="size-4 text-muted-foreground" /> Work experience
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {staff.experience.length === 0 ? (
              <p className="text-sm text-muted-foreground">No work experience records.</p>
            ) : (
              staff.experience.map((ex, i) => (
                <div key={ex.id}>
                  {i > 0 && <Separator className="mb-3" />}
                  <div className="font-medium">{ex.organization}</div>
                  <div className="text-sm text-muted-foreground">{ex.role ?? "—"}</div>
                  {range(ex.startDate, ex.endDate) && (
                    <div className="mt-0.5 text-xs text-muted-foreground/80">
                      {range(ex.startDate, ex.endDate)}
                    </div>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarClock className="size-4 text-muted-foreground" /> Recent leave requests
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {staff.leaveRequests.length === 0 ? (
            <EmptyState
              title="No leave requests"
              description="This staff member has no leave history."
              className="m-5"
              icon={CalendarClock}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staff.leaveRequests.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell>{humanize(l.type)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {l.startDate.toLocaleDateString()} – {l.endDate.toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <StatusBadge state={l.state} />
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
