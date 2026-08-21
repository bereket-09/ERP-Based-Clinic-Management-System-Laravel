"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, LogIn, LogOut, Loader2 } from "lucide-react";
import { humanize } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { markAttendanceAction, clockInOutAction } from "./actions";

const STATUSES = ["PRESENT", "ABSENT", "LATE", "ON_LEAVE", "HALF_DAY"] as const;

/** Prev / date-picker / next navigation for the attendance day. */
export function AttendanceDateNav({ date }: { date: string }) {
  const router = useRouter();

  function go(param: string) {
    router.push(`/hr/attendance?date=${param}`);
  }

  function shift(days: number) {
    const d = new Date(`${date}T00:00:00.000Z`);
    d.setUTCDate(d.getUTCDate() + days);
    go(d.toISOString().slice(0, 10));
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="icon-sm" aria-label="Previous day" onClick={() => shift(-1)}>
        <ChevronLeft className="size-4" />
      </Button>
      <Input
        type="date"
        value={date}
        className="w-auto"
        onChange={(e) => e.target.value && go(e.target.value)}
      />
      <Button variant="outline" size="icon-sm" aria-label="Next day" onClick={() => shift(1)}>
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}

/** Per-row status Select — auto-saves on change. */
export function StatusSelect({
  userId,
  date,
  status,
}: {
  userId: string;
  date: string;
  status: string | null;
}) {
  const router = useRouter();
  const [pending, start] = React.useTransition();
  const [value, setValue] = React.useState(status ?? "");

  function onChange(next: string) {
    setValue(next);
    const fd = new FormData();
    fd.set("userId", userId);
    fd.set("date", date);
    fd.set("status", next);
    start(async () => {
      const r = await markAttendanceAction({}, fd);
      if (r.ok) {
        toast.success("Attendance updated");
        router.refresh();
      } else {
        toast.error(r.error ?? "Could not update attendance");
        setValue(status ?? "");
      }
    });
  }

  return (
    <Select value={value} onValueChange={onChange} disabled={pending}>
      <SelectTrigger className="w-[150px]">
        <SelectValue placeholder="Not marked" />
      </SelectTrigger>
      <SelectContent>
        {STATUSES.map((s) => (
          <SelectItem key={s} value={s}>
            {humanize(s)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/** Clock-in / clock-out button for today. */
export function ClockButton({
  userId,
  hasClockIn,
  hasClockOut,
}: {
  userId: string;
  hasClockIn: boolean;
  hasClockOut: boolean;
}) {
  const router = useRouter();
  const [pending, start] = React.useTransition();

  const isClockOut = hasClockIn && !hasClockOut;
  const done = hasClockIn && hasClockOut;

  function onClick() {
    const fd = new FormData();
    fd.set("userId", userId);
    start(async () => {
      const r = await clockInOutAction({}, fd);
      if (r.ok) {
        toast.success(isClockOut ? "Clocked out" : "Clocked in");
        router.refresh();
      } else {
        toast.error(r.error ?? "Could not record the clock event");
      }
    });
  }

  if (done) {
    return <span className="text-xs text-muted-foreground">Clocked out</span>;
  }

  return (
    <Button variant="outline" size="sm" onClick={onClick} disabled={pending}>
      {pending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : isClockOut ? (
        <LogOut className="size-4" />
      ) : (
        <LogIn className="size-4" />
      )}
      {isClockOut ? "Clock out" : "Clock in"}
    </Button>
  );
}
