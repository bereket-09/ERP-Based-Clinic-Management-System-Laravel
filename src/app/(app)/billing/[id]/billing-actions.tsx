"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, CreditCard, CheckCircle2, Ban } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { InvoiceEvent } from "@/server/fsm";
import { formatETB } from "@/lib/money";
import { recordPaymentAction, transitionInvoiceAction } from "./actions";

interface Affordance {
  event: string;
  label: string;
  intent: string;
}

const METHODS = ["CASH", "CARD", "MOBILE", "WAIVER", "INSURANCE"] as const;

const INTENT_VARIANT: Record<string, React.ComponentProps<typeof Button>["variant"]> = {
  primary: "primary",
  success: "success",
  danger: "destructive",
  default: "default",
};

export function BillingActions({
  invoiceId,
  balance,
  canPay,
  affordances,
}: {
  invoiceId: string;
  balance: number;
  canPay: boolean;
  affordances: Affordance[];
}) {
  const router = useRouter();
  const [pending, start] = React.useTransition();
  const [open, setOpen] = React.useState(false);
  const [amount, setAmount] = React.useState(balance > 0 ? String(balance) : "");
  const [method, setMethod] = React.useState<string>("CASH");
  const [reference, setReference] = React.useState("");

  const fire = (event: InvoiceEvent, label: string) =>
    start(async () => {
      const r = await transitionInvoiceAction(invoiceId, event);
      if (r.ok) {
        toast.success(`${label} done`);
        router.refresh();
      } else toast.error(r.error ?? "Failed");
    });

  const submitPayment = () =>
    start(async () => {
      const r = await recordPaymentAction(invoiceId, {
        amount: Number(amount),
        method,
        reference: reference || undefined,
      });
      if (r.ok) {
        toast.success("Payment recorded");
        setOpen(false);
        setReference("");
        router.refresh();
      } else toast.error(r.error ?? "Failed");
    });

  return (
    <div className="flex flex-wrap items-center gap-2">
      {affordances.map((a) => (
        <Button
          key={a.event}
          variant={INTENT_VARIANT[a.intent] ?? "default"}
          size="sm"
          disabled={pending}
          onClick={() => fire(a.event as InvoiceEvent, a.label)}
        >
          {pending ? (
            <Loader2 className="animate-spin" />
          ) : a.event === "void" ? (
            <Ban className="size-4" />
          ) : (
            <CheckCircle2 className="size-4" />
          )}
          {a.label}
        </Button>
      ))}

      {canPay && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="primary" size="sm">
              <CreditCard className="size-4" /> Record payment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record payment</DialogTitle>
              <DialogDescription>
                Balance due: <span className="font-medium text-foreground">ETB {formatETB(balance)}</span>
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="amount">Amount (ETB) *</Label>
                <Input
                  id="amount"
                  type="number"
                  min={0}
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Method *</Label>
                <Select value={method} onValueChange={setMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {METHODS.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m.charAt(0) + m.slice(1).toLowerCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reference">Reference</Label>
                <Input
                  id="reference"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="Receipt / transaction no."
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="button" variant="primary" onClick={submitPayment} disabled={pending}>
                {pending ? <Loader2 className="animate-spin" /> : <CreditCard className="size-4" />} Record payment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
