import { Badge, type BadgeProps } from "@/components/ui/badge";
import { humanize } from "@/lib/utils";

type Variant = NonNullable<BadgeProps["variant"]>;

// Explicit overrides win; otherwise we infer from the state name.
const OVERRIDES: Record<string, Variant> = {
  COMPLETED: "success",
  DISPENSED: "success",
  RETURNED: "success",
  APPROVED: "success",
  RESULTS_READY: "success",
  LAB_RESULTS_READY: "success",
  FULFILLED: "success",
  DISCHARGED: "success",
  ACKNOWLEDGED: "info",
  CANCELLED: "danger",
  REJECTED: "danger",
  OUT_OF_STOCK: "danger",
  CRITICAL: "danger",
  HIGH: "warning",
  LOW: "warning",
  NORMAL: "success",
  ON_LEAVE: "warning",
  SUSPENDED: "danger",
  TERMINATED: "danger",
  ACTIVE: "success",
};

function inferVariant(state: string): Variant {
  if (OVERRIDES[state]) return OVERRIDES[state];
  if (/CANCEL|REJECT|FAIL|EXPIR|LOST|DAMAGED/.test(state)) return "danger";
  if (/COMPLET|DONE|APPROV|DISPENS|RETURN|READY|VERIFIED|SUCCESS|PAID/.test(state)) return "success";
  if (/WAIT|PENDING|DRAFT|SUBMIT|ORDERED|QUEUE|REQUEST/.test(state)) return "warning";
  if (/PROGRESS|CONSULT|TRIAGE|COLLECT|ON_WARD|ADMITTED|PARTIAL/.test(state)) return "info";
  return "brand";
}

export function StatusBadge({
  state,
  label,
  className,
}: {
  state: string | null | undefined;
  label?: string;
  className?: string;
}) {
  if (!state) return null;
  return (
    <Badge variant={inferVariant(state)} className={className}>
      {label ?? humanize(state)}
    </Badge>
  );
}
