"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { saveConsultationAction } from "./actions";

export function ConsultEditor({
  visitId,
  initial,
}: {
  visitId: string;
  initial: { chiefComplaint?: string; symptoms?: string; diagnosis?: string; disease?: string; icdCode?: string; notes?: string };
}) {
  const router = useRouter();
  const [pending, start] = React.useTransition();
  const [f, setF] = React.useState({
    chiefComplaint: initial.chiefComplaint ?? "",
    symptoms: initial.symptoms ?? "",
    diagnosis: initial.diagnosis ?? "",
    disease: initial.disease ?? "",
    icdCode: initial.icdCode ?? "",
    notes: initial.notes ?? "",
  });

  const save = () =>
    start(async () => {
      const r = await saveConsultationAction(visitId, f);
      if (r.ok) {
        toast.success("Consultation saved");
        router.refresh();
      } else toast.error(r.error ?? "Save failed");
    });

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Chief complaint</Label>
          <Input value={f.chiefComplaint} onChange={(e) => setF({ ...f, chiefComplaint: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label>Symptoms</Label>
          <Input value={f.symptoms} onChange={(e) => setF({ ...f, symptoms: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label>Diagnosis</Label>
          <Input value={f.diagnosis} onChange={(e) => setF({ ...f, diagnosis: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label>Condition / disease</Label>
          <Input value={f.disease} onChange={(e) => setF({ ...f, disease: e.target.value })} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Notes</Label>
        <Textarea value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} />
      </div>
      <Button onClick={save} disabled={pending} variant="default">
        {pending ? <Loader2 className="animate-spin" /> : <Save className="size-4" />} Save consultation
      </Button>
    </div>
  );
}
