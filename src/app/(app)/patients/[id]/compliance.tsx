"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import { AlertTriangle, Plus, Syringe, ClipboardList, ShieldAlert, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/status-badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { humanize } from "@/lib/utils";
import { addAllergyAction, addProblemAction, addImmunizationAction, resolveProblemAction } from "./clinical-actions";

export interface Allergy { id: string; substance: string; reaction: string | null; severity: string }
export interface Problem { id: string; problem: string; icdCode: string | null; status: string; createdAt: string }
export interface Immunization { id: string; vaccine: string; dose: string | null; givenAt: string }

const selectCls = "flex h-10 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none focus-visible:border-primary";

function useRun() {
  const router = useRouter();
  const [pending, start] = React.useTransition();
  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, onOk?: () => void) =>
    start(async () => {
      const r = await fn();
      if (r.ok) { toast.success("Saved"); onOk?.(); router.refresh(); }
      else toast.error(r.error ?? "Failed");
    });
  return { pending, run };
}

export function Compliance({
  patientId,
  allergies,
  problems,
  immunizations,
}: {
  patientId: string;
  allergies: Allergy[];
  problems: Problem[];
  immunizations: Immunization[];
}) {
  const severe = allergies.filter((a) => a.severity === "SEVERE");

  return (
    <div className="space-y-4">
      {severe.length > 0 && (
        <div className="flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <ShieldAlert className="size-5 shrink-0" />
          <span><strong>Severe allergy:</strong> {severe.map((a) => a.substance).join(", ")}</span>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <AllergyCard patientId={patientId} allergies={allergies} />
        <ProblemCard patientId={patientId} problems={problems} />
        <ImmunizationCard patientId={patientId} immunizations={immunizations} />
      </div>
    </div>
  );
}

function AllergyCard({ patientId, allergies }: { patientId: string; allergies: Allergy[] }) {
  const { pending, run } = useRun();
  const [open, setOpen] = React.useState(false);
  const [f, setF] = React.useState({ substance: "", reaction: "", severity: "MILD" });
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-sm"><AlertTriangle className="size-4 text-warning" /> Allergies</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="icon-sm" variant="ghost"><Plus className="size-4" /></Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add allergy</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1.5"><Label>Substance</Label><Input value={f.substance} onChange={(e) => setF({ ...f, substance: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Reaction</Label><Input value={f.reaction} onChange={(e) => setF({ ...f, reaction: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Severity</Label>
                <select className={selectCls} value={f.severity} onChange={(e) => setF({ ...f, severity: e.target.value })}>
                  <option value="MILD">Mild</option><option value="MODERATE">Moderate</option><option value="SEVERE">Severe</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="primary" disabled={pending} onClick={() => run(() => addAllergyAction({ patientId, ...f } as never), () => setOpen(false))}>Add</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {allergies.length === 0 ? <p className="text-sm text-muted-foreground">No known allergies.</p> : (
          <ul className="space-y-2">
            {allergies.map((a) => (
              <li key={a.id} className="flex items-center justify-between text-sm">
                <span>{a.substance}{a.reaction ? ` — ${a.reaction}` : ""}</span>
                <StatusBadge state={a.severity} />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function ProblemCard({ patientId, problems }: { patientId: string; problems: Problem[] }) {
  const { pending, run } = useRun();
  const [open, setOpen] = React.useState(false);
  const [f, setF] = React.useState({ problem: "", icdCode: "" });
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-sm"><ClipboardList className="size-4 text-primary" /> Problem list</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="icon-sm" variant="ghost"><Plus className="size-4" /></Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add problem</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1.5"><Label>Problem / condition</Label><Input value={f.problem} onChange={(e) => setF({ ...f, problem: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>ICD-10 (optional)</Label><Input value={f.icdCode} onChange={(e) => setF({ ...f, icdCode: e.target.value })} /></div>
            </div>
            <DialogFooter>
              <Button variant="primary" disabled={pending} onClick={() => run(() => addProblemAction({ patientId, ...f }), () => setOpen(false))}>Add</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {problems.length === 0 ? <p className="text-sm text-muted-foreground">No active problems.</p> : (
          <ul className="space-y-2">
            {problems.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-2 text-sm">
                <span>{p.problem}{p.icdCode ? ` (${p.icdCode})` : ""}</span>
                <div className="flex items-center gap-1.5">
                  <StatusBadge state={p.status} />
                  {p.status === "ACTIVE" && (
                    <Button size="icon-sm" variant="ghost" disabled={pending} onClick={() => run(() => resolveProblemAction(p.id, patientId))} title="Mark resolved">
                      <Check className="size-4" />
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function ImmunizationCard({ patientId, immunizations }: { patientId: string; immunizations: Immunization[] }) {
  const { pending, run } = useRun();
  const [open, setOpen] = React.useState(false);
  const [f, setF] = React.useState({ vaccine: "", dose: "" });
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-sm"><Syringe className="size-4 text-success" /> Immunizations</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="icon-sm" variant="ghost"><Plus className="size-4" /></Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Record immunization</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1.5"><Label>Vaccine</Label><Input value={f.vaccine} onChange={(e) => setF({ ...f, vaccine: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Dose</Label><Input value={f.dose} onChange={(e) => setF({ ...f, dose: e.target.value })} /></div>
            </div>
            <DialogFooter>
              <Button variant="primary" disabled={pending} onClick={() => run(() => addImmunizationAction({ patientId, ...f }), () => setOpen(false))}>Record</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {immunizations.length === 0 ? <p className="text-sm text-muted-foreground">No records.</p> : (
          <ul className="space-y-2">
            {immunizations.map((i) => (
              <li key={i.id} className="flex items-center justify-between text-sm">
                <span>{i.vaccine}{i.dose ? ` · ${i.dose}` : ""}</span>
                <Badge variant="outline">{format(new Date(i.givenAt), "PP")}</Badge>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
