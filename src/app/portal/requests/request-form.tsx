"use client";
import { useActionState, useEffect, useRef } from "react";
import { AlertCircle, CheckCircle2, Loader2, Send } from "lucide-react";
import { submitRequest, type RequestState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function RequestForm() {
  const [state, action, pending] = useActionState<RequestState, FormData>(submitRequest, {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state.ok]);

  return (
    <form ref={formRef} action={action} className="space-y-4">
      {state.ok && (
        <div className="flex items-start gap-2 rounded-lg border border-success/30 bg-success/10 px-3 py-2.5 text-sm text-success">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
          <span>Your request has been sent to the clinic reception. They will follow up with you.</span>
        </div>
      )}
      {state.error && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="reason">What do you need?</Label>
        <Textarea
          id="reason"
          name="reason"
          required
          minLength={5}
          placeholder="e.g. I need a sick-leave note for the days I was unwell, or a copy of my prescription."
          className="min-h-28"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="date">Preferred / relevant date (optional)</Label>
        <Input id="date" name="date" type="date" className="w-full sm:w-56" />
      </div>

      <Button type="submit" variant="primary" disabled={pending}>
        {pending ? <Loader2 className="animate-spin" /> : <Send />}
        {pending ? "Sending…" : "Submit request"}
      </Button>
    </form>
  );
}
