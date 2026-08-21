import { format } from "date-fns";
import { UserCircle, Mail, Phone, Building2, CalendarDays, AtSign } from "lucide-react";
import { requireStaff } from "@/server/session";
import { db } from "@/server/db";
import { humanize, initials } from "@/lib/utils";
import { roleLabel } from "@/lib/rbac";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/status-badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { canFire, leaveMachine } from "@/server/fsm";
import { AccountForm, PasswordForm } from "./account-form";
import { SecuritySection, type PasskeyView } from "./security-section";
import {
  LeaveSection,
  type LeaveBalanceView,
  type LeaveRequestView,
} from "./leave-section";

const MS_PER_DAY = 86_400_000;

export const metadata = { title: "My profile" };

export default async function ProfilePage() {
  const actor = await requireStaff();
  const user = await db.user.findUnique({
    where: { id: actor.id },
    include: {
      department: true,
      education: true,
      experience: true,
      leaveRequests: { orderBy: { createdAt: "desc" }, take: 5 },
      authenticators: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!user) return null;

  // ── Leave tab data (own requests + current-year balances) ────────────────
  const currentYear = new Date().getFullYear();
  const [leaveRows, balanceRows] = await Promise.all([
    db.leaveRequest.findMany({
      where: { employeeId: actor.id },
      orderBy: { createdAt: "desc" },
    }),
    db.leaveBalance.findMany({
      where: { userId: actor.id, year: currentYear },
      orderBy: { type: "asc" },
    }),
  ]);

  const leaveRequests: LeaveRequestView[] = leaveRows.map((l) => ({
    id: l.id,
    type: l.type,
    startDate: l.startDate.toISOString(),
    endDate: l.endDate.toISOString(),
    days:
      Math.round((l.endDate.getTime() - l.startDate.getTime()) / MS_PER_DAY) + 1,
    state: l.state,
    createdAt: l.createdAt.toISOString(),
    canCancel: canFire(leaveMachine, l.state, "cancel", { role: actor.role }),
  }));

  const leaveBalances: LeaveBalanceView[] = balanceRows.map((b) => ({
    type: b.type,
    entitled: b.entitled,
    used: b.used,
    remaining: b.entitled - b.used,
  }));

  const passkeys: PasskeyView[] = user.authenticators.map((a) => ({
    id: a.id,
    label: a.label,
    deviceType: a.deviceType,
    backedUp: a.backedUp,
    createdAt: a.createdAt.toISOString(),
    lastUsedAt: a.lastUsedAt?.toISOString() ?? null,
  }));

  return (
    <div className="space-y-6">
      <PageHeader title="My profile" description="Your account, security and employment details." icon={UserCircle} />

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="leave">Leave</TabsTrigger>
        </TabsList>

        {/* ── Overview ─────────────────────────────────────────────── */}
        <TabsContent value="overview">
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
                  {user.username && <div className="flex items-center gap-2"><AtSign className="size-4 text-muted-foreground" /> {user.username}</div>}
                  {user.phone && <div className="flex items-center gap-2"><Phone className="size-4 text-muted-foreground" /> {user.phone}</div>}
                  {user.department && <div className="flex items-center gap-2"><Building2 className="size-4 text-muted-foreground" /> {user.department.name}</div>}
                  <div className="flex items-center gap-2"><CalendarDays className="size-4 text-muted-foreground" /> Joined {format(user.joinedAt, "PP")}</div>
                  <div className="flex items-center gap-2">Status: <StatusBadge state={user.employmentStatus} /></div>
                  {user.speciality && <div className="text-muted-foreground">Speciality: {user.speciality}</div>}
                  <div className="flex items-center gap-2">
                    2FA: <Badge variant={user.mfaEnabled ? "success" : "default"}>{user.mfaEnabled ? "On" : "Off"}</Badge>
                  </div>
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
        </TabsContent>

        {/* ── Account ──────────────────────────────────────────────── */}
        <TabsContent value="account">
          <div className="mx-auto max-w-2xl space-y-6">
            <AccountForm name={user.name} username={user.username} email={user.email} />
            <PasswordForm />
          </div>
        </TabsContent>

        {/* ── Security ─────────────────────────────────────────────── */}
        <TabsContent value="security">
          <div className="mx-auto max-w-2xl">
            <SecuritySection mfaEnabled={user.mfaEnabled} passkeys={passkeys} />
          </div>
        </TabsContent>

        {/* ── Leave ────────────────────────────────────────────────── */}
        <TabsContent value="leave">
          <LeaveSection
            requests={leaveRequests}
            balances={leaveBalances}
            year={currentYear}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
