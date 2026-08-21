"use client";
import * as React from "react";
import { useActionState } from "react";
import { Loader2, Stethoscope } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { issueSickLeaveAction, type IssueSickLeaveState } from "./actions";

export function SickLeaveForm({
  visitId,
  defaultDiagnosis,
}: {
  visitId: string;
  defaultDiagnosis?: string | null;
}) {
  const [state, action, pending] = useActionState<IssueSickLeaveState, FormData>(
    issueSickLeaveAction,
    {},
  );

  const today = new Date().toISOString().slice(0, 10);
  const [from, setFrom] = React.useState(today);
  const [to, setTo] = React.useState(today);

  const days = React.useMemo(() => {
    const f = Date.parse(from);
    const t = Date.parse(to);
    if (Number.isNaN(f) || Number.isNaN(t) || t < f) return null;
    return Math.floor((t - f) / 86_400_000) + 1;
  }, [from, to]);

  return (
    <Card className="max-w-xl">
      <CardHeader className="flex-row items-center gap-2">
        <Stethoscope className="size-4 text-primary" />
        <CardTitle>Sick-leave certificate</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-5">
          <input type="hidden" name="visitId" value={visitId} />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="fromDate">From *</Label>
              <Input
                id="fromDate"
                name="fromDate"
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="toDate">To *</Label>
              <Input
                id="toDate"
                name="toDate"
                type="date"
                value={to}
                min={from}
                onChange={(e) => setTo(e.target.value)}
                required
              />
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Duration:{" "}
            <span className="font-medium text-foreground">
              {days != null ? `${days} day${days === 1 ? "" : "s"}` : "—"}
            </span>
          </p>

          <div className="space-y-1.5">
            <Label htmlFor="diagnosis">Diagnosis</Label>
            <Input
              id="diagnosis"
              name="diagnosis"
              placeholder="e.g. Acute viral pharyngitis"
              defaultValue={defaultDiagnosis ?? ""}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="recommendation">Recommendation</Label>
            <Textarea
              id="recommendation"
              name="recommendation"
              placeholder="Rest at home, plenty of fluids, follow up if symptoms persist"
            />
          </div>

          {state.error && <p className="text-sm text-destructive">{state.error}</p>}

          <Button type="submit" variant="primary" disabled={pending}>
            {pending ? <Loader2 className="animate-spin" /> : <Stethoscope />} Issue &amp; print
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
