"use client";
import * as React from "react";
import Link from "next/link";
import { useActionState } from "react";
import { Loader2, Search, UserCheck, UserPlus, Sparkles, AlertCircle, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  lookupStudent,
  registerAndVisit,
  startVisitForExisting,
  type LookupState,
  type RegisterState,
} from "./actions";

type Doctor = { id: string; name: string };

const selectCls =
  "flex h-10 w-full rounded-lg border border-input bg-card px-3 text-sm shadow-sm focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/40 outline-none";

function VisitFields({ doctors }: { doctors: Doctor[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor="chiefComplaint">Chief complaint</Label>
        <Input id="chiefComplaint" name="chiefComplaint" placeholder="e.g. Fever and headache" />
      </div>
      <div className="space-y-1.5">
        <Label>Priority</Label>
        <select name="priority" className={selectCls} defaultValue="ROUTINE">
          <option value="ROUTINE">Routine</option>
          <option value="URGENT">Urgent</option>
          <option value="EMERGENCY">Emergency</option>
        </select>
      </div>
      <div className="space-y-1.5">
        <Label>Assign doctor</Label>
        <select name="doctorId" className={selectCls} defaultValue="">
          <option value="">Any available</option>
          {doctors.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function ExistingPatientForm({
  patient,
  doctors,
}: {
  patient: NonNullable<LookupState["existing"]>;
  doctors: Doctor[];
}) {
  const [state, action, pending] = useActionState<RegisterState, FormData>(startVisitForExisting, {});
  return (
    <form action={action} className="space-y-4 rounded-xl border border-primary/30 bg-accent/40 p-4">
      <div className="flex items-center gap-2">
        <UserCheck className="size-5 text-primary" />
        <div>
          <div className="font-medium">{patient.name}</div>
          <div className="text-xs text-muted-foreground">
            {patient.mrn} {patient.studentId ? `· ${patient.studentId}` : ""} · existing record
          </div>
        </div>
        <Badge variant="brand" className="ml-auto">
          Returning
        </Badge>
      </div>
      <input type="hidden" name="patientId" value={patient.id} />
      <VisitFields doctors={doctors} />
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" variant="primary" disabled={pending}>
        {pending ? <Loader2 className="animate-spin" /> : <UserCheck />} Start visit & queue
      </Button>
    </form>
  );
}

function RegisterForm({
  sims,
  studentId,
  doctors,
}: {
  sims?: LookupState["sims"];
  studentId?: string;
  doctors: Doctor[];
}) {
  const [state, action, pending] = useActionState<RegisterState, FormData>(registerAndVisit, {});
  return (
    <form action={action} className="space-y-4 rounded-xl border border-border p-4">
      <div className="flex items-center gap-2">
        <UserPlus className="size-5 text-primary" />
        <div className="font-medium">Register new patient</div>
        {sims && (
          <Badge variant="success" className="ml-auto">
            <Sparkles className="size-3" /> Prefilled from SIMS
          </Badge>
        )}
      </div>

      <input type="hidden" name="fromSims" value={sims ? "true" : "false"} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="studentId">Student ID</Label>
          <Input id="studentId" name="studentId" defaultValue={sims?.studentId ?? studentId ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="name">Full name *</Label>
          <Input id="name" name="name" required defaultValue={sims?.name ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label>Gender</Label>
          <select name="gender" className={selectCls} defaultValue={sims?.gender ?? ""}>
            <option value="">—</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" defaultValue={sims?.phone ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="college">College</Label>
          <Input id="college" name="college" defaultValue={sims?.college ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="program">Program</Label>
          <Input id="program" name="program" defaultValue={sims?.program ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="yearOfStudy">Year</Label>
          <Input id="yearOfStudy" name="yearOfStudy" defaultValue={sims?.yearOfStudy ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="bloodType">Blood type</Label>
          <Input id="bloodType" name="bloodType" defaultValue={sims?.bloodType ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="emergencyContactName">Emergency contact</Label>
          <Input id="emergencyContactName" name="emergencyContactName" defaultValue={sims?.emergencyContactName ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="emergencyContactPhone">Emergency phone</Label>
          <Input id="emergencyContactPhone" name="emergencyContactPhone" defaultValue={sims?.emergencyContactPhone ?? ""} />
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <p className="mb-3 text-sm font-medium">Open a visit</p>
        <VisitFields doctors={doctors} />
      </div>

      {state.duplicate && (
        <div className="flex flex-col gap-2 rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-warning" />
            <span>
              A record already exists for this student ID —{" "}
              <span className="font-medium">{state.duplicate.name}</span>{" "}
              <span className="font-mono tabular-nums text-muted-foreground">({state.duplicate.mrn})</span>. No duplicate
              was created.
            </span>
          </div>
          <Button asChild variant="outline" size="sm" className="shrink-0">
            <Link href={`/patients/${state.duplicate.id}`}>
              Open record <ArrowRight />
            </Link>
          </Button>
        </div>
      )}
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" variant="primary" disabled={pending}>
        {pending ? <Loader2 className="animate-spin" /> : <UserPlus />} Register & start visit
      </Button>
    </form>
  );
}

export function ReceptionConsole({ doctors }: { doctors: Doctor[] }) {
  const [look, lookAction, looking] = useActionState<LookupState, FormData>(lookupStudent, {});

  return (
    <Card>
      <CardHeader>
        <CardTitle>Find or register a patient</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <form action={lookAction} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input name="studentId" placeholder="Student ID (e.g. DDU/1001/14) or name" className="pl-9" />
          </div>
          <Button type="submit" disabled={looking}>
            {looking ? <Loader2 className="animate-spin" /> : <Search />} Look up
          </Button>
        </form>

        {look.error && <p className="text-sm text-destructive">{look.error}</p>}

        {look.notFound && (
          <p className="text-sm text-muted-foreground">
            No record or SIMS match for “{look.studentId}”. Fill in the details to register.
          </p>
        )}

        {look.existing && <ExistingPatientForm patient={look.existing} doctors={doctors} />}
        {(look.sims || look.notFound) && (
          <RegisterForm sims={look.sims} studentId={look.studentId} doctors={doctors} />
        )}
      </CardContent>
    </Card>
  );
}
