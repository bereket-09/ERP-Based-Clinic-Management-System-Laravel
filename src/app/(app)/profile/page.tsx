import { format } from "date-fns";
import { UserCircle, Mail, Phone, Building2, CalendarDays } from "lucide-react";
import { requireStaff } from "@/server/session";
import { db } from "@/server/db";
import { humanize, initials } from "@/lib/utils";
import { roleLabel } from "@/lib/rbac";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/status-badge";

export const metadata = { title: "My profile" };

export default async function ProfilePage() {
  const actor = await requireStaff();
  const user = await db.user.findUnique({
    where: { id: actor.id },
    include: { department: true, education: true, experience: true, leaveRequests: { orderBy: { createdAt: "desc" }, take: 5 } },
  });
  if (!user) return null;

  return (
    <div className="space-y-6">
      <PageHeader title="My profile" description="Your account and employment details." icon={UserCircle} />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <Avatar className="size-16">
                <AvatarFallback className="text-lg">{initials(user.name)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="text-lg font-semibold">{user.name}</div>
                <Badge variant="brand">{roleLabel(user.role)}</Badge>
              </div>
            </div>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex items-center gap-2"><Mail className="size-4 text-muted-foreground" /> {user.email}</div>
              {user.phone && <div className="flex items-center gap-2"><Phone className="size-4 text-muted-foreground" /> {user.phone}</div>}
              {user.department && <div className="flex items-center gap-2"><Building2 className="size-4 text-muted-foreground" /> {user.department.name}</div>}
              <div className="flex items-center gap-2"><CalendarDays className="size-4 text-muted-foreground" /> Joined {format(user.joinedAt, "PP")}</div>
              <div className="flex items-center gap-2">Status: <StatusBadge state={user.employmentStatus} /></div>
              {user.speciality && <div className="text-muted-foreground">Speciality: {user.speciality}</div>}
            </dl>
          </CardContent>
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>Education</CardTitle></CardHeader>
            <CardContent>
              {user.education.length === 0 ? (
                <p className="text-sm text-muted-foreground">No education records.</p>
              ) : (
                <ul className="space-y-2">
                  {user.education.map((e) => (
                    <li key={e.id} className="text-sm">
                      <span className="font-medium">{e.institution}</span> — {[e.field, e.level].filter(Boolean).join(", ")}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Recent leave</CardTitle></CardHeader>
            <CardContent>
              {user.leaveRequests.length === 0 ? (
                <p className="text-sm text-muted-foreground">No leave requests.</p>
              ) : (
                <ul className="space-y-2">
                  {user.leaveRequests.map((l) => (
                    <li key={l.id} className="flex items-center justify-between text-sm">
                      <span>{humanize(l.type)} · {format(l.startDate, "PP")}–{format(l.endDate, "PP")}</span>
                      <StatusBadge state={l.state} />
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
