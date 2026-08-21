"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { Affordance } from "@/server/fsm/engine";
import type { LabResultInput } from "@/server/services/lab";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/status-badge";
import { labTransition } from "./actions";

interface Item {
  id: string;
  state: string;
  resultValue: string | null;
  resultFlag: string | null;
  test: { name: string; unit: string | null; refRangeText: string | null; refRangeLow: number | null; refRangeHigh: number | null };
}

const flagCls =
  "h-9 rounded-lg border border-input bg-card px-2 text-sm outline-none focus-visible:border-primary";

function variant(intent: string): ButtonProps["variant"] {
  return intent === "primary" ? "primary" : intent === "success" ? "success" : intent === "danger" ? "destructive" : "default";
}

export function LabOrderClient({
  orderId,
  items,
  affordances,
  editable,
}: {
  orderId: string;
  items: Item[];
  affordances: Affordance[];
  editable: boolean;
}) {
  const router = useRouter();
  const [pending, start] = React.useTransition();
  const [results, setResults] = React.useState<Record<string, { resultValue: string; resultFlag: string }>>(
    Object.fromEntries(items.map((i) => [i.id, { resultValue: i.resultValue ?? "", resultFlag: i.resultFlag ?? "" }])),
  );

  const setR = (id: string, patch: Partial<{ resultValue: string; resultFlag: string }>) =>
    setResults((s) => ({ ...s, [id]: { ...s[id], ...patch } }));

  const fire = (event: string, payload: { results?: LabResultInput[]; reason?: string } = {}) =>
    start(async () => {
      const r = await labTransition(orderId, event as never, payload);
      if (r.ok) {
        toast.success("Updated");
        router.refresh();
      } else toast.error(r.error ?? "Failed");
    });

  const submitResults = () => {
    const payload: LabResultInput[] = items.map((i) => ({
      itemId: i.id,
      resultValue: results[i.id]?.resultValue || undefined,
      resultFlag: (results[i.id]?.resultFlag || undefined) as LabResultInput["resultFlag"],
    }));
    fire("submit_results", { results: payload });
  };

  return (
    <div className="space-y-5">
      <div className="divide-y divide-border rounded-xl border border-border">
        {items.map((it) => {
          const range =
            it.test.refRangeText ??
            (it.test.refRangeLow != null && it.test.refRangeHigh != null ? `${it.test.refRangeLow}–${it.test.refRangeHigh}` : null);
          return (
            <div key={it.id} className="flex flex-wrap items-center gap-3 p-3">
              <div className="min-w-0 flex-1">
                <div className="font-medium">{it.test.name}</div>
                <div className="text-xs text-muted-foreground">
                  {range ? `Ref: ${range}${it.test.unit ? ` ${it.test.unit}` : ""}` : it.test.unit ?? ""}
                </div>
              </div>
              {editable ? (
                <>
                  <Input
                    className="w-32"
                    placeholder="Result"
                    value={results[it.id]?.resultValue ?? ""}
                    onChange={(e) => setR(it.id, { resultValue: e.target.value })}
                  />
                  <select className={flagCls} value={results[it.id]?.resultFlag ?? ""} onChange={(e) => setR(it.id, { resultFlag: e.target.value })}>
                    <option value="">Flag</option>
                    <option value="NORMAL">Normal</option>
                    <option value="LOW">Low</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  {it.resultValue && <span className="font-mono text-sm">{it.resultValue}{it.test.unit ? ` ${it.test.unit}` : ""}</span>}
                  {it.resultFlag && <StatusBadge state={it.resultFlag} />}
                  <StatusBadge state={it.state} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        {affordances.map((a) =>
          a.event === "submit_results" ? (
            <Button key={a.event} variant={variant(a.intent)} disabled={pending} onClick={submitResults}>
              {pending && <Loader2 className="animate-spin" />} {a.label}
            </Button>
          ) : (
            <Button
              key={a.event}
              variant={variant(a.intent)}
              disabled={pending}
              onClick={() => fire(a.event, a.event === "cancel" ? { reason: "Cancelled by lab" } : {})}
            >
              {a.label}
            </Button>
          ),
        )}
      </div>
    </div>
  );
}
