"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { Affordance } from "@/server/fsm/engine";
import { Button, type ButtonProps } from "@/components/ui/button";
import { referralTransition } from "./actions";

function variant(intent: string): ButtonProps["variant"] {
  return intent === "primary"
    ? "primary"
    : intent === "success"
      ? "success"
      : intent === "danger"
        ? "destructive"
        : "default";
}

export function ReferralActions({
  referralId,
  affordances,
}: {
  referralId: string;
  affordances: Affordance[];
}) {
  const router = useRouter();
  const [pending, start] = React.useTransition();

  const fire = (event: string, reason?: string) =>
    start(async () => {
      const r = await referralTransition(referralId, event as never, reason);
      if (r.ok) {
        toast.success("Referral updated");
        router.refresh();
      } else {
        toast.error(r.error ?? "Failed");
      }
    });

  if (affordances.length === 0) {
    return <p className="text-sm text-muted-foreground">No actions available for this referral.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {affordances.map((a) => (
        <Button
          key={a.event}
          variant={variant(a.intent)}
          disabled={pending}
          onClick={() => fire(a.event, a.event === "cancel" ? "Cancelled" : undefined)}
        >
          {pending && <Loader2 className="animate-spin" />} {a.label}
        </Button>
      ))}
    </div>
  );
}
