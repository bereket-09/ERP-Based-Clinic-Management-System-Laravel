"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, UserPlus, Undo2, AlertTriangle, Ban } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { assignAssetAction, returnAssetAction } from "../actions";

const selectCls =
  "flex h-10 w-full rounded-lg border border-input bg-card px-3 text-sm shadow-sm focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/40 outline-none";

export type StaffOption = { id: string; name: string; role: string };

export function AssignAssetButton({
  assetId,
  staff,
}: {
  assetId: string;
  staff: StaffOption[];
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [userId, setUserId] = React.useState("");
  const [quantity, setQuantity] = React.useState(1);
  const [error, setError] = React.useState<string>();
  const [pending, start] = React.useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const r = await assignAssetAction({ assetId, userId, quantity });
      if (r.ok) {
        toast.success("Asset assigned");
        setError(undefined);
        setOpen(false);
        setUserId("");
        setQuantity(1);
        router.refresh();
      } else {
        setError(r.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="primary" onClick={() => setOpen(true)}>
        <UserPlus className="size-4" /> Assign
      </Button>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assign asset</DialogTitle>
          <DialogDescription>Issue this asset to a staff member.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Staff member *</Label>
            <select className={selectCls} value={userId} onChange={(e) => setUserId(e.target.value)} required>
              <option value="">Select a staff member…</option>
              {staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} · {s.role}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="assign-qty">Quantity</Label>
            <Input
              id="assign-qty"
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={pending || !userId}>
              {pending ? <Loader2 className="animate-spin" /> : <UserPlus className="size-4" />} Assign
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ReturnAssetMenu({ assignmentId }: { assignmentId: string }) {
  const router = useRouter();
  const [pending, start] = React.useTransition();

  function run(state: "RETURNED" | "LOST" | "DAMAGED", label: string) {
    start(async () => {
      const r = await returnAssetAction(assignmentId, state);
      if (r.ok) {
        toast.success(label);
        router.refresh();
      } else {
        toast.error(r.error ?? "Action failed");
      }
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={pending}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Undo2 className="size-4" />} Close out
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => run("RETURNED", "Marked returned")}>
          <Undo2 className="size-4" /> Returned
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => run("DAMAGED", "Marked damaged")}>
          <AlertTriangle className="size-4" /> Damaged
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => run("LOST", "Marked lost")}>
          <Ban className="size-4" /> Lost
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
