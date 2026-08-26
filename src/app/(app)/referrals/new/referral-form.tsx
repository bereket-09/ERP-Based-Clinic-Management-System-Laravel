"use client";
import * as React from "react";
import { useActionState } from "react";
import { Loader2, Share2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createReferralAction, type NewReferralState } from "./actions";

type PatientOption = { id: string; name: string; mrn: string };

const selectCls =
  "flex h-10 w-full rounded-lg border border-input bg-card px-3 text-sm shadow-sm focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/40 outline-none";

export function ReferralForm({ patients }: { patients: PatientOption[] }) {
  const [state, action, pending] = useActionState<NewReferralState, FormData>(
    createReferralAction,
    {},
  );

  return (
    <Card>
      <CardHeader className="flex-row items-center gap-2">
        <Share2 className="size-4 text-primary" />
        <CardTitle>Referral details</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="patientId">Patient *</Label>
            <select id="patientId" name="patientId" className={selectCls} defaultValue="" required>
              <option value="" disabled>
                Select a patient
              </option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.mrn})
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="toFacility">Destination facility *</Label>
              <Input
                id="toFacility"
                name="toFacility"
                placeholder="e.g. Dilla University Referral Hospital"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="toDepartment">Department</Label>
              <Input id="toDepartment" name="toDepartment" placeholder="e.g. Cardiology" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="urgency">Urgency</Label>
              <select id="urgency" name="urgency" className={selectCls} defaultValue="ROUTINE">
                <option value="ROUTINE">Routine</option>
                <option value="URGENT">Urgent</option>
                <option value="EMERGENCY">Emergency</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="reason">Reason for referral *</Label>
            <Textarea
              id="reason"
              name="reason"
              placeholder="Why is the patient being referred?"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="clinicalSummary">Clinical summary</Label>
            <Textarea
              id="clinicalSummary"
              name="clinicalSummary"
              placeholder="Relevant history, findings, and treatment given so far"
            />
          </div>

          {state.error && <p className="text-sm text-destructive">{state.error}</p>}

          <Button type="submit" variant="primary" disabled={pending}>
            {pending ? <Loader2 className="animate-spin" /> : <Share2 />} Create &amp; issue referral
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
