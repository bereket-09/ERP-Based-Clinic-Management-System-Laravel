"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, PackageCheck, Ban } from "lucide-react";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { receivePurchaseOrderAction, cancelPurchaseOrderAction } from "../actions";

export type ReceivableItem = {
  id: string;
  itemName: string;
  quantity: number;
  received: number;
};

export function PurchaseOrderActions({
  poId,
  items,
  canReceive,
  canCancel,
}: {
  poId: string;
  items: ReceivableItem[];
  canReceive: boolean;
  canCancel: boolean;
}) {
  const router = useRouter();
  const [receiveOpen, setReceiveOpen] = React.useState(false);
  const [cancelOpen, setCancelOpen] = React.useState(false);

  return (
    <div className="flex flex-wrap gap-2">
      {canReceive && (
        <Button variant="primary" onClick={() => setReceiveOpen(true)}>
          <PackageCheck className="size-4" /> Receive stock
        </Button>
      )}
      {canCancel && (
        <Button variant="outline" onClick={() => setCancelOpen(true)}>
          <Ban className="size-4" /> Cancel
        </Button>
      )}
      {receiveOpen && (
        <ReceiveDialog poId={poId} items={items} onClose={() => setReceiveOpen(false)} onDone={() => router.refresh()} />
      )}
      {cancelOpen && (
        <CancelDialog poId={poId} onClose={() => setCancelOpen(false)} onDone={() => router.refresh()} />
      )}
    </div>
  );
}

function ReceiveDialog({
  poId,
  items,
  onClose,
  onDone,
}: {
  poId: string;
  items: ReceivableItem[];
  onClose: () => void;
  onDone: () => void;
}) {
  const outstanding = items.map((i) => ({ ...i, remaining: Math.max(0, i.quantity - i.received) }));
  const [qty, setQty] = React.useState<Record<string, number>>(
    Object.fromEntries(outstanding.map((i) => [i.id, i.remaining])),
  );
  const [error, setError] = React.useState<string>();
  const [pending, start] = React.useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const receipts = outstanding
      .map((i) => ({ itemId: i.id, quantity: Math.min(qty[i.id] ?? 0, i.remaining) }))
      .filter((r) => r.quantity > 0);
    if (receipts.length === 0) {
      setError("Enter a quantity to receive for at least one line.");
      return;
    }
    start(async () => {
      const r = await receivePurchaseOrderAction(poId, receipts);
      if (r.ok) {
        toast.success("Stock received");
        onClose();
        onDone();
      } else {
        setError(r.error);
      }
    });
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Receive stock</DialogTitle>
          <DialogDescription>Record the quantities delivered against this order.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead className="text-right">Outstanding</TableHead>
                <TableHead className="w-28 text-right">Receive</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {outstanding.map((i) => (
                <TableRow key={i.id}>
                  <TableCell className="font-medium">{i.itemName}</TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">{i.remaining}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min={0}
                      max={i.remaining}
                      className="text-right"
                      value={qty[i.id] ?? 0}
                      disabled={i.remaining === 0}
                      onChange={(e) => setQty((q) => ({ ...q, [i.id]: Number(e.target.value) }))}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={pending}>
              {pending ? <Loader2 className="animate-spin" /> : <PackageCheck className="size-4" />} Confirm receipt
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CancelDialog({ poId, onClose, onDone }: { poId: string; onClose: () => void; onDone: () => void }) {
  const [reason, setReason] = React.useState("");
  const [error, setError] = React.useState<string>();
  const [pending, start] = React.useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const r = await cancelPurchaseOrderAction(poId, reason || undefined);
      if (r.ok) {
        toast.success("Purchase order cancelled");
        onClose();
        onDone();
      } else {
        setError(r.error);
      }
    });
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Cancel purchase order</DialogTitle>
          <DialogDescription>This closes the order. It cannot be received afterwards.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason (optional)" />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              Keep order
            </Button>
            <Button type="submit" variant="destructive" disabled={pending}>
              {pending ? <Loader2 className="animate-spin" /> : <Ban className="size-4" />} Cancel order
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
