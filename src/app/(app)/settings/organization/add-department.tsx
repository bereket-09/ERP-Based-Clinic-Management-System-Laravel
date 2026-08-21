"use client";
import * as React from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { addDepartmentAction } from "./actions";

const selectCls = "flex h-10 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none focus-visible:border-primary";

export function AddDepartment() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [state, action, pending] = useActionState(addDepartmentAction, {});

  React.useEffect(() => {
    if (state && !state.error && !pending) {
      // closed on successful submit (no error and not pending after an attempt)
    }
  }, [state, pending]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="primary"><Plus className="size-4" /> Add department</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>New department</DialogTitle></DialogHeader>
        <form
          action={async (fd) => {
            await action(fd);
            setOpen(false);
            router.refresh();
          }}
          className="space-y-3"
        >
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input name="name" required placeholder="e.g. Dental Unit" />
          </div>
          <div className="space-y-1.5">
            <Label>Type</Label>
            <select name="kind" className={selectCls} defaultValue="CLINICAL">
              <option value="CLINICAL">Clinical</option>
              <option value="ACADEMIC">Academic (college)</option>
              <option value="ADMIN">Administrative</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>Code (optional)</Label>
            <Input name="code" placeholder="e.g. DEN" />
          </div>
          {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
          <DialogFooter>
            <Button type="submit" variant="primary" disabled={pending}>
              {pending && <Loader2 className="animate-spin" />} Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
