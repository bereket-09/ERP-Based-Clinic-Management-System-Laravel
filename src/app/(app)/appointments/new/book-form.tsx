"use client";
import * as React from "react";
import { useActionState } from "react";
import { CalendarPlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { bookAppointment, type BookState } from "./actions";

const selectCls =
  "flex h-10 w-full rounded-lg border border-input bg-card px-3 text-sm shadow-sm focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/40 outline-none";

export interface PatientOption {
  id: string;
  name: string;
  mrn: string;
  studentId: string | null;
}
export interface ProviderOption {
  id: string;
  name: string;
}

/** Local datetime string (yyyy-MM-ddTHH:mm) for the datetime-local default. */
function defaultWhen(): string {
  const d = new Date();
  d.setMinutes(0, 0, 0);
  d.setHours(d.getHours() + 1);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function BookForm({
  patients,
  providers,
  defaultProviderId,
}: {
  patients: PatientOption[];
  providers: ProviderOption[];
  defaultProviderId?: string;
}) {
  const [state, action, pending] = useActionState<BookState, FormData>(bookAppointment, {});

  return (
    <form action={action} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="patientId">Patient *</Label>
        <select id="patientId" name="patientId" required className={selectCls} defaultValue="">
          <option value="" disabled>
            Select a patient…
          </option>
          {patients.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} · {p.mrn}
              {p.studentId ? ` · ${p.studentId}` : ""}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="providerId">Provider</Label>
          <select
            id="providerId"
            name="providerId"
            className={selectCls}
            defaultValue={defaultProviderId ?? ""}
          >
            <option value="">Any available</option>
            {providers.map((d) => (
              <option key={d.id} value={d.id}>
                Dr. {d.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="durationMin">Duration (minutes)</Label>
          <Input
            id="durationMin"
            name="durationMin"
            type="number"
            min={5}
            max={480}
            step={5}
            defaultValue={20}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="scheduledFor">Date &amp; time *</Label>
        <Input
          id="scheduledFor"
          name="scheduledFor"
          type="datetime-local"
          required
          defaultValue={defaultWhen()}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="reason">Reason</Label>
        <Textarea
          id="reason"
          name="reason"
          rows={3}
          placeholder="e.g. Follow-up consultation, routine check-up…"
        />
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" variant="primary" disabled={pending}>
        {pending ? <Loader2 className="animate-spin" /> : <CalendarPlus />} Book appointment
      </Button>
    </form>
  );
}
