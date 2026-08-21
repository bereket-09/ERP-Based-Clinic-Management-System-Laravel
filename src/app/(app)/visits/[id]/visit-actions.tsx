"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import type { Affordance } from "@/server/fsm/engine";
import type { TransitionPayload } from "@/server/services/visit";
import type { ButtonProps } from "@/components/ui/button";
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
import { advanceVisit } from "./actions";

export interface Catalog {
  labTests: { id: string; name: string; category: string | null; price: number }[];
  medications: { id: string; name: string; strength: string | null; form: string | null }[];
  wards: { id: string; name: string; beds: { id: string; label: string; status: string }[] }[];
  doctors: { id: string; name: string }[];
}

const selectCls =
  "flex h-10 w-full rounded-lg border border-input bg-card px-3 text-sm shadow-sm focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/40 outline-none";

function intentVariant(intent: string): ButtonProps["variant"] {
  switch (intent) {
    case "primary":
      return "primary";
    case "success":
      return "success";
    case "danger":
      return "destructive";
    default:
      return "default";
  }
}

export function VisitActions({
  visitId,
  affordances,
  catalog,
}: {
  visitId: string;
  affordances: Affordance[];
  catalog: Catalog;
}) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  const [dialog, setDialog] = React.useState<Affordance | null>(null);

  const run = React.useCallback(
    (event: string, payload: TransitionPayload) => {
      startTransition(async () => {
        const r = await advanceVisit(visitId, event as never, payload);
        if (r.ok) {
          toast.success("Updated");
          setDialog(null);
          router.refresh();
        } else {
          toast.error(r.error ?? "Action failed");
        }
      });
    },
    [visitId, router],
  );

  if (affordances.length === 0) {
    return <p className="text-sm text-muted-foreground">No actions available in this state for your role.</p>;
  }

  return (
    <>
      <div className="grid gap-2">
        {affordances.map((a) => (
          <Button
            key={a.event + a.to}
            variant={intentVariant(a.intent)}
            className="justify-start"
            disabled={pending}
            onClick={() => (a.form ? setDialog(a) : run(a.event, {}))}
          >
            {a.label}
          </Button>
        ))}
      </div>

      {dialog && (
        <ActionDialog
          affordance={dialog}
          catalog={catalog}
          pending={pending}
          onCancel={() => setDialog(null)}
          onSubmit={(payload) => run(dialog.event, payload)}
        />
      )}
    </>
  );
}

function ActionDialog({
  affordance,
  catalog,
  pending,
  onCancel,
  onSubmit,
}: {
  affordance: Affordance;
  catalog: Catalog;
  pending: boolean;
  onCancel: () => void;
  onSubmit: (payload: TransitionPayload) => void;
}) {
  return (
    <Dialog open onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{affordance.label}</DialogTitle>
          {affordance.description && <DialogDescription>{affordance.description}</DialogDescription>}
        </DialogHeader>
        {affordance.form === "labOrder" && <LabForm catalog={catalog} pending={pending} onSubmit={onSubmit} />}
        {affordance.form === "drugOrder" && <DrugForm catalog={catalog} pending={pending} onSubmit={onSubmit} />}
        {affordance.form === "referral" && <ReferralForm pending={pending} onSubmit={onSubmit} />}
        {affordance.form === "admission" && <AdmissionForm catalog={catalog} pending={pending} onSubmit={onSubmit} />}
        {affordance.form === "diagnosis" && <DiagnosisForm pending={pending} onSubmit={onSubmit} />}
        {affordance.form === "vitals" && <VitalsForm pending={pending} onSubmit={onSubmit} />}
        {affordance.form === "assignDoctor" && <AssignDoctorForm catalog={catalog} pending={pending} onSubmit={onSubmit} />}
        {(affordance.form === "cancelReason" || affordance.form === "discharge") && (
          <ReasonForm label={affordance.form === "discharge" ? "Discharge notes" : "Reason"} pending={pending} onSubmit={onSubmit} />
        )}
      </DialogContent>
    </Dialog>
  );
}

function SubmitRow({ pending, label }: { pending: boolean; label: string }) {
  return (
    <DialogFooter>
      <Button type="submit" variant="primary" disabled={pending}>
        {pending && <Loader2 className="animate-spin" />} {label}
      </Button>
    </DialogFooter>
  );
}

function LabForm({ catalog, pending, onSubmit }: { catalog: Catalog; pending: boolean; onSubmit: (p: TransitionPayload) => void }) {
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [query, setQuery] = React.useState("");
  const filtered = catalog.labTests.filter((t) => t.name.toLowerCase().includes(query.toLowerCase()));
  const toggle = (id: string) =>
    setSelected((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ testIds: [...selected] });
      }}
      className="space-y-3"
    >
      <Input placeholder="Search tests…" value={query} onChange={(e) => setQuery(e.target.value)} />
      <div className="max-h-64 space-y-1 overflow-y-auto rounded-lg border border-border p-1">
        {filtered.map((t) => (
          <label key={t.id} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted">
            <input type="checkbox" checked={selected.has(t.id)} onChange={() => toggle(t.id)} className="size-4 accent-[var(--primary)]" />
            <span className="flex-1 text-sm">{t.name}</span>
            <span className="text-xs text-muted-foreground">{t.category}</span>
          </label>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">{selected.size} selected</p>
      <SubmitRow pending={pending || selected.size === 0} label="Order tests" />
    </form>
  );
}

interface DrugRow {
  medicationId: string;
  dose: string;
  frequency: string;
  duration: string;
  quantity: number;
  instructions: string;
}

function DrugForm({ catalog, pending, onSubmit }: { catalog: Catalog; pending: boolean; onSubmit: (p: TransitionPayload) => void }) {
  const [rows, setRows] = React.useState<DrugRow[]>([
    { medicationId: catalog.medications[0]?.id ?? "", dose: "", frequency: "", duration: "", quantity: 1, instructions: "" },
  ]);
  const update = (i: number, patch: Partial<DrugRow>) =>
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ drugs: rows.filter((r) => r.medicationId && r.quantity > 0) });
      }}
      className="space-y-3"
    >
      <div className="max-h-72 space-y-3 overflow-y-auto">
        {rows.map((row, i) => (
          <div key={i} className="rounded-lg border border-border p-3">
            <div className="flex items-center gap-2">
              <select className={selectCls} value={row.medicationId} onChange={(e) => update(i, { medicationId: e.target.value })}>
                {catalog.medications.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} {m.strength ?? ""} {m.form ? `(${m.form})` : ""}
                  </option>
                ))}
              </select>
              {rows.length > 1 && (
                <Button type="button" variant="ghost" size="icon-sm" onClick={() => setRows((r) => r.filter((_, idx) => idx !== i))}>
                  <Trash2 className="size-4" />
                </Button>
              )}
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Input placeholder="Dose" value={row.dose} onChange={(e) => update(i, { dose: e.target.value })} />
              <Input placeholder="Freq (TID)" value={row.frequency} onChange={(e) => update(i, { frequency: e.target.value })} />
              <Input placeholder="Duration" value={row.duration} onChange={(e) => update(i, { duration: e.target.value })} />
              <Input type="number" min={1} placeholder="Qty" value={row.quantity} onChange={(e) => update(i, { quantity: Number(e.target.value) })} />
            </div>
            <Input className="mt-2" placeholder="Instructions (optional)" value={row.instructions} onChange={(e) => update(i, { instructions: e.target.value })} />
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setRows((r) => [...r, { medicationId: catalog.medications[0]?.id ?? "", dose: "", frequency: "", duration: "", quantity: 1, instructions: "" }])}
      >
        <Plus className="size-4" /> Add medication
      </Button>
      <SubmitRow pending={pending} label="Prescribe" />
    </form>
  );
}

function ReferralForm({ pending, onSubmit }: { pending: boolean; onSubmit: (p: TransitionPayload) => void }) {
  const [f, setF] = React.useState({ toFacility: "", toDepartment: "", reason: "", clinicalSummary: "", urgency: "ROUTINE" as const });
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ referral: f });
      }}
      className="space-y-3"
    >
      <div className="space-y-1.5">
        <Label>Refer to facility *</Label>
        <Input required value={f.toFacility} onChange={(e) => setF({ ...f, toFacility: e.target.value })} placeholder="e.g. Dilchora Referral Hospital" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Department</Label>
          <Input value={f.toDepartment} onChange={(e) => setF({ ...f, toDepartment: e.target.value })} placeholder="e.g. Surgery" />
        </div>
        <div className="space-y-1.5">
          <Label>Urgency</Label>
          <select className={selectCls} value={f.urgency} onChange={(e) => setF({ ...f, urgency: e.target.value as never })}>
            <option value="ROUTINE">Routine</option>
            <option value="URGENT">Urgent</option>
            <option value="EMERGENCY">Emergency</option>
          </select>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Reason *</Label>
        <Input required value={f.reason} onChange={(e) => setF({ ...f, reason: e.target.value })} />
      </div>
      <div className="space-y-1.5">
        <Label>Clinical summary</Label>
        <Textarea value={f.clinicalSummary} onChange={(e) => setF({ ...f, clinicalSummary: e.target.value })} />
      </div>
      <SubmitRow pending={pending} label="Issue referral" />
    </form>
  );
}

function AdmissionForm({ catalog, pending, onSubmit }: { catalog: Catalog; pending: boolean; onSubmit: (p: TransitionPayload) => void }) {
  const [wardId, setWardId] = React.useState(catalog.wards[0]?.id ?? "");
  const [bedId, setBedId] = React.useState("");
  const [reason, setReason] = React.useState("");
  const beds = catalog.wards.find((w) => w.id === wardId)?.beds.filter((b) => b.status === "AVAILABLE") ?? [];
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ admission: { wardId, bedId: bedId || undefined, reason } });
      }}
      className="space-y-3"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Ward</Label>
          <select className={selectCls} value={wardId} onChange={(e) => { setWardId(e.target.value); setBedId(""); }}>
            {catalog.wards.map((w) => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label>Bed</Label>
          <select className={selectCls} value={bedId} onChange={(e) => setBedId(e.target.value)}>
            <option value="">Auto / none</option>
            {beds.map((b) => (
              <option key={b.id} value={b.id}>{b.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Reason for admission</Label>
        <Textarea value={reason} onChange={(e) => setReason(e.target.value)} />
      </div>
      <SubmitRow pending={pending} label="Admit patient" />
    </form>
  );
}

function DiagnosisForm({ pending, onSubmit }: { pending: boolean; onSubmit: (p: TransitionPayload) => void }) {
  const [f, setF] = React.useState({ diagnosis: "", disease: "", icdCode: "", notes: "" });
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ diagnosis: f });
      }}
      className="space-y-3"
    >
      <div className="space-y-1.5">
        <Label>Diagnosis *</Label>
        <Input required value={f.diagnosis} onChange={(e) => setF({ ...f, diagnosis: e.target.value })} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Condition / disease</Label>
          <Input value={f.disease} onChange={(e) => setF({ ...f, disease: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label>ICD code</Label>
          <Input value={f.icdCode} onChange={(e) => setF({ ...f, icdCode: e.target.value })} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Notes</Label>
        <Textarea value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} />
      </div>
      <SubmitRow pending={pending} label="Complete visit" />
    </form>
  );
}

function VitalsForm({ pending, onSubmit }: { pending: boolean; onSubmit: (p: TransitionPayload) => void }) {
  const [v, setV] = React.useState<Record<string, string>>({});
  const set = (k: string, val: string) => setV((s) => ({ ...s, [k]: val }));
  const num = (k: string) => (v[k] ? Number(v[k]) : undefined);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          vitals: {
            temperatureC: num("temperatureC"),
            pulseBpm: num("pulseBpm"),
            systolic: num("systolic"),
            diastolic: num("diastolic"),
            spo2: num("spo2"),
            weightKg: num("weightKg"),
          },
        });
      }}
      className="grid grid-cols-2 gap-3 sm:grid-cols-3"
    >
      {[
        ["temperatureC", "Temp °C"],
        ["pulseBpm", "Pulse"],
        ["systolic", "Systolic"],
        ["diastolic", "Diastolic"],
        ["spo2", "SpO₂ %"],
        ["weightKg", "Weight kg"],
      ].map(([k, label]) => (
        <div key={k} className="space-y-1.5">
          <Label>{label}</Label>
          <Input type="number" step="any" value={v[k] ?? ""} onChange={(e) => set(k, e.target.value)} />
        </div>
      ))}
      <div className="col-span-full">
        <SubmitRow pending={pending} label="Save & start triage" />
      </div>
    </form>
  );
}

function AssignDoctorForm({ catalog, pending, onSubmit }: { catalog: Catalog; pending: boolean; onSubmit: (p: TransitionPayload) => void }) {
  const [doctorId, setDoctorId] = React.useState(catalog.doctors[0]?.id ?? "");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ doctorId });
      }}
      className="space-y-3"
    >
      <div className="space-y-1.5">
        <Label>Assign to doctor</Label>
        <select className={selectCls} value={doctorId} onChange={(e) => setDoctorId(e.target.value)}>
          {catalog.doctors.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </div>
      <SubmitRow pending={pending} label="Send to doctor" />
    </form>
  );
}

function ReasonForm({ label, pending, onSubmit }: { label: string; pending: boolean; onSubmit: (p: TransitionPayload) => void }) {
  const [reason, setReason] = React.useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ reason });
      }}
      className="space-y-3"
    >
      <div className="space-y-1.5">
        <Label>{label}</Label>
        <Textarea value={reason} onChange={(e) => setReason(e.target.value)} required />
      </div>
      <SubmitRow pending={pending} label="Confirm" />
    </form>
  );
}
