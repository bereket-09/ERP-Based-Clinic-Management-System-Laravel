"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Loader2, Plus, Trash2, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { upsertShiftAction, deleteShiftAction } from "./actions";

export type ShiftCellData = {
  id: string;
  startTime: string;
  endTime: string;
  area: string | null;
  note: string | null;
} | null;

/** Prev / week-picker / next navigation for the roster week. */
export function WeekNav({ week }: { week: string }) {
  const router = useRouter();

  function go(param: string) {
    router.push(`/hr/roster?week=${param}`);
  }

  function shift(days: number) {
    const d = new Date(`${week}T00:00:00.000Z`);
    d.setUTCDate(d.getUTCDate() + days);
    go(d.toISOString().slice(0, 10));
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="icon-sm" aria-label="Previous week" onClick={() => shift(-7)}>
        <ChevronLeft className="size-4" />
      </Button>
      <Input
        type="date"
        value={week}
        className="w-auto"
        onChange={(e) => e.target.value && go(e.target.value)}
      />
      <Button variant="outline" size="icon-sm" aria-label="Next week" onClick={() => shift(7)}>
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}

/** A single roster cell: shows the shift (if any) and opens an edit dialog. */
export function ShiftCell({
  userId,
  userName,
  dateParam,
  dateLabel,
  shift,
}: {
  userId: string;
  userName: string;
  dateParam: string;
  dateLabel: string;
  shift: ShiftCellData;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState<string>();
  const [pending, start] = React.useTransition();
  const [deleting, startDelete] = React.useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("userId", userId);
    fd.set("date", dateParam);
    start(async () => {
      const r = await upsertShiftAction({}, fd);
      if (r.ok) {
        toast.success(shift ? "Shift updated" : "Shift added");
        setError(undefined);
        setOpen(false);
        router.refresh();
      } else {
        setError(r.error);
      }
    });
  }

  function handleDelete() {
    if (!shift) return;
    const fd = new FormData();
    fd.set("id", shift.id);
    startDelete(async () => {
      const r = await deleteShiftAction({}, fd);
      if (r.ok) {
        toast.success("Shift removed");
        setOpen(false);
        router.refresh();
      } else {
        setError(r.error);
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "flex min-h-[52px] w-full flex-col items-start justify-center gap-0.5 rounded-lg border px-2 py-1.5 text-left text-xs transition-colors",
          shift
            ? "border-primary/30 bg-primary/10 hover:bg-primary/15"
            : "border-dashed border-border text-muted-foreground hover:bg-muted",
        )}
      >
        {shift ? (
          <>
            <span className="font-semibold text-foreground">
              {shift.startTime}–{shift.endTime}
            </span>
            {shift.area && <span className="text-muted-foreground">{shift.area}</span>}
          </>
        ) : (
          <span className="flex items-center gap-1">
            <Plus className="size-3" /> Add
          </span>
        )}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{shift ? "Edit shift" : "Add shift"}</DialogTitle>
            <DialogDescription>
              {userName} · {dateLabel}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor={`start-${userId}-${dateParam}`}>Start time</Label>
                <Input
                  id={`start-${userId}-${dateParam}`}
                  name="startTime"
                  type="time"
                  required
                  defaultValue={shift?.startTime ?? "08:00"}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`end-${userId}-${dateParam}`}>End time</Label>
                <Input
                  id={`end-${userId}-${dateParam}`}
                  name="endTime"
                  type="time"
                  required
                  defaultValue={shift?.endTime ?? "16:00"}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`area-${userId}-${dateParam}`}>Area / ward</Label>
              <Input
                id={`area-${userId}-${dateParam}`}
                name="area"
                defaultValue={shift?.area ?? ""}
                placeholder="e.g. Triage, OPD, Ward A"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`note-${userId}-${dateParam}`}>Note</Label>
              <Textarea
                id={`note-${userId}-${dateParam}`}
                name="note"
                defaultValue={shift?.note ?? ""}
                placeholder="Optional note…"
              />
            </div>
            <DialogFooter className="sm:justify-between">
              {shift ? (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleting || pending}
                >
                  {deleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                  Remove
                </Button>
              ) : (
                <span />
              )}
              <div className="flex gap-2">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={pending || deleting}>
                  {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                  Save
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
