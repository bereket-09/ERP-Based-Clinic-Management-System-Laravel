"use client";
import * as React from "react";
import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";
import { CalendarPlus, Loader2, Plane, Wallet, X } from "lucide-react";
import type { LeaveState, LeaveType } from "@prisma/client";
import { humanize } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import {
  requestLeaveAction,
  cancelLeaveAction,
  type LeaveFormState,
} from "./leave-actions";

const LEAVE_TYPES: LeaveType[] = [
  "ANNUAL",
  "SICK",
  "MATERNITY",
  "PATERNITY",
  "UNPAID",
  "BEREAVEMENT",
  "STUDY",
];

export interface LeaveRequestView {
  id: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  days: number;
  state: LeaveState;
  createdAt: string;
  canCancel: boolean;
}

export interface LeaveBalanceView {
  type: LeaveType;
  entitled: number;
  used: number;
  remaining: number;
}

export function LeaveSection({
  requests,
  balances,
  year,
}: {
  requests: LeaveRequestView[];
  balances: LeaveBalanceView[];
  year: number;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <RequestLeaveCard />
      </div>
      <div className="space-y-6 lg:col-span-2">
        <BalancesCard balances={balances} year={year} />
        <RequestsCard requests={requests} />
      </div>
    </div>
  );
}

// ── Request leave ────────────────────────────────────────────────────────────

function RequestLeaveCard() {
  const router = useRouter();
  const [type, setType] = React.useState<LeaveType>("ANNUAL");
  const [state, action, pending] = useActionState<LeaveFormState, FormData>(
    requestLeaveAction,
    {},
  );

  useEffect(() => {
    if (state.ok) {
      toast.success("Leave request submitted");
      setType("ANNUAL");
      router.refresh();
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarPlus className="size-4 text-muted-foreground" /> Request leave
        </CardTitle>
        <CardDescription>Submit a leave request to HR for approval.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4" key={state.ok ? "reset" : "form"}>
          <input type="hidden" name="type" value={type} />
          <div className="space-y-1.5">
            <Label>Leave type</Label>
            <Select value={type} onValueChange={(v) => setType(v as LeaveType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LEAVE_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {humanize(t)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="startDate">Start date</Label>
              <Input id="startDate" name="startDate" type="date" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="endDate">End date</Label>
              <Input id="endDate" name="endDate" type="date" required />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="reason">Reason</Label>
            <Textarea
              id="reason"
              name="reason"
              placeholder="Optional context for your request…"
            />
          </div>

          <Button type="submit" variant="primary" disabled={pending} className="w-full">
            {pending ? <Loader2 className="animate-spin" /> : <Plane className="size-4" />}
            Submit request
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// ── Balances ─────────────────────────────────────────────────────────────────

function BalancesCard({
  balances,
  year,
}: {
  balances: LeaveBalanceView[];
  year: number;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="size-4 text-muted-foreground" /> My balances
        </CardTitle>
        <CardDescription>Entitlement and usage for {year}.</CardDescription>
      </CardHeader>
      <CardContent>
        {balances.length === 0 ? (
          <EmptyState
            icon={Wallet}
            title="No balances yet"
            description="HR hasn't set your leave entitlements for this year."
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {balances.map((b) => (
              <div
                key={b.type}
                className="rounded-2xl border border-border bg-card/50 p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{humanize(b.type)}</span>
                  <span className="text-sm font-semibold text-foreground">
                    {b.remaining}
                    <span className="text-muted-foreground"> left</span>
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {b.used} used of {b.entitled} days
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── My requests ──────────────────────────────────────────────────────────────

function RequestsCard({ requests }: { requests: LeaveRequestView[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My requests</CardTitle>
        <CardDescription>Your leave requests, newest first.</CardDescription>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <EmptyState
            icon={CalendarPlus}
            title="No leave requests"
            description="Requests you submit will appear here with their status."
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{humanize(r.type)}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(r.startDate), "PP")} –{" "}
                      {format(new Date(r.endDate), "PP")}
                    </TableCell>
                    <TableCell>{r.days}</TableCell>
                    <TableCell>
                      <StatusBadge state={r.state} />
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {format(new Date(r.createdAt), "PP")}
                    </TableCell>
                    <TableCell className="text-right">
                      {r.canCancel ? <CancelButton leaveId={r.id} /> : null}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CancelButton({ leaveId }: { leaveId: string }) {
  const router = useRouter();
  const [state, action, pending] = useActionState<LeaveFormState, FormData>(
    cancelLeaveAction,
    {},
  );

  useEffect(() => {
    if (state.ok) {
      toast.success("Leave request cancelled");
      router.refresh();
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  return (
    <form action={action} className="inline">
      <input type="hidden" name="leaveId" value={leaveId} />
      <Button type="submit" variant="ghost" size="sm" disabled={pending}>
        {pending ? <Loader2 className="animate-spin" /> : <X className="size-4" />}
        Cancel
      </Button>
    </form>
  );
}
