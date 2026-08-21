"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { Affordance } from "@/server/fsm/engine";
import type { ButtonProps } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { advanceAppointment } from "./actions";

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

/**
 * Renders the FSM affordances for an appointment as action buttons.
 * `layout="rail"` (default) stacks full-width buttons for the detail action rail;
 * `layout="inline"` renders compact buttons for the day agenda rows.
 */
export function AppointmentActions({
  appointmentId,
  affordances,
  layout = "rail",
}: {
  appointmentId: string;
  affordances: Affordance[];
  layout?: "rail" | "inline";
}) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();

  const run = React.useCallback(
    (event: string) => {
      startTransition(async () => {
        const r = await advanceAppointment(appointmentId, event as never);
        if (r.ok) {
          toast.success("Updated");
          router.refresh();
        } else {
          toast.error(r.error ?? "Action failed");
        }
      });
    },
    [appointmentId, router],
  );

  if (affordances.length === 0) {
    return layout === "rail" ? (
      <p className="text-sm text-muted-foreground">
        No actions available in this state for your role.
      </p>
    ) : null;
  }

  return (
    <div className={cn(layout === "rail" ? "grid gap-2" : "flex flex-wrap items-center gap-1.5")}>
      {affordances.map((a) => (
        <Button
          key={a.event + a.to}
          variant={intentVariant(a.intent)}
          size={layout === "rail" ? "md" : "sm"}
          className={cn(layout === "rail" && "justify-start")}
          disabled={pending}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            run(a.event);
          }}
        >
          {pending && <Loader2 className="animate-spin" />}
          {a.label}
        </Button>
      ))}
    </div>
  );
}
