import Link from "next/link";
import { CalendarClock } from "lucide-react";
import { LeaveState } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import { requireRole } from "@/server/session";
import { db } from "@/server/db";
import { availableTransitions, leaveMachine } from "@/server/fsm";
import { humanize, cn } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { NewLeaveDialog } from "./new-leave-dialog";
import { LeaveActions, type Affordance } from "./leave-actions";

export const metadata = { title: "Leave requests" };

const FILTERS: { value: string; label: string }[] = [
  { value: "", label: "All" },
  { value: LeaveState.SUBMITTED, label: "Pending" },
  { value: LeaveState.APPROVED, label: "Approved" },
  { value: LeaveState.ACTIVE, label: "On leave" },
  { value: LeaveState.RETURN_REQUESTED, label: "Return requested" },
  { value: LeaveState.RETURNED, label: "Returned" },
  { value: LeaveState.REJECTED, label: "Rejected" },
  { value: LeaveState.CANCELLED, label: "Cancelled" },
];

export default async function LeaveListPage({
  searchParams,
}: {
  searchParams: Promise<{ state?: string }>;
}) {
  const actor = await requireRole("HR");
  const { state } = await searchParams;

  const isValidState = (Object.values(LeaveState) as string[]).includes(state ?? "");
  const where: Prisma.LeaveRequestWhereInput = isValidState
    ? { state: state as LeaveState }
    : {};

  const [leaves, employees] = await Promise.all([
    db.leaveRequest.findMany({
      where,
      include: { employee: true, approver: true },
      orderBy: { createdAt: "desc" },
    }),
    db.user.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const activeFilter = isValidState ? state : "";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leave requests"
        description="Review, approve and track staff leave across the clinic."
        icon={CalendarClock}
        actions={<NewLeaveDialog employees={employees} />}
      />

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.value || "all"}
            href={f.value ? `/hr/leave?state=${f.value}` : "/hr/leave"}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm transition-colors",
              activeFilter === f.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:bg-muted",
            )}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          {leaves.length === 0 ? (
            <EmptyState
              title="No leave requests"
              description="Nothing matches this filter yet."
              className="m-5"
              icon={CalendarClock}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaves.map((l) => {
                  const affordances = availableTransitions(leaveMachine, l.state, {
                    role: actor.role,
                  }) as Affordance[];
                  return (
                    <TableRow key={l.id}>
                      <TableCell>
                        <div className="font-medium">{l.employee.name}</div>
                        {l.approver && (
                          <div className="text-xs text-muted-foreground">
                            Decided by {l.approver.name}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{humanize(l.type)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {l.startDate.toLocaleDateString()} – {l.endDate.toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <StatusBadge state={l.state} />
                      </TableCell>
                      <TableCell className="text-right">
                        <LeaveActions leaveId={l.id} affordances={affordances} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
