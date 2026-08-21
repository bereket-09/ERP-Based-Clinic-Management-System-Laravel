"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, FlaskConical } from "lucide-react";
import type { Affordance } from "@/server/fsm/engine";
import type { LabResultInput } from "@/server/services/lab";
import { cn } from "@/lib/utils";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { labTransition } from "./actions";

interface Item {
  id: string;
  state: string;
  resultValue: string | null;
  resultFlag: string | null;
  resultNotes: string | null;
  test: {
    name: string;
    specimen: string | null;
    unit: string | null;
    refRangeText: string | null;
    refRangeLow: number | null;
    refRangeHigh: number | null;
  };
}

const flagCls =
  "h-9 rounded-lg border border-input bg-card px-2 text-sm outline-none focus-visible:border-primary";

function variant(intent: string): ButtonProps["variant"] {
  return intent === "primary"
    ? "primary"
    : intent === "success"
      ? "success"
      : intent === "danger"
        ? "destructive"
        : "default";
}

/** Human-readable reference range for a test. */
function rangeLabel(t: Item["test"]): string | null {
  if (t.refRangeText) return t.refRangeText;
  const { refRangeLow: lo, refRangeHigh: hi } = t;
  const unit = t.unit ? ` ${t.unit}` : "";
  if (lo != null && hi != null) return `${lo} – ${hi}${unit}`;
  if (lo != null) return `≥ ${lo}${unit}`;
  if (hi != null) return `≤ ${hi}${unit}`;
  return null;
}

/** Derive a flag from a numeric result against the reference bounds. */
function computeFlag(value: string, t: Item["test"]): string | null {
  const n = Number(value);
  if (!value.trim() || Number.isNaN(n)) return null;
  const { refRangeLow: lo, refRangeHigh: hi } = t;
  if (lo == null && hi == null) return null;
  if (lo != null && n < lo) return "LOW";
  if (hi != null && n > hi) return "HIGH";
  return "NORMAL";
}

const FLAG_TONE: Record<string, string> = {
  NORMAL: "bg-success/15 text-success ring-success/20",
  LOW: "bg-warning/15 text-warning ring-warning/20",
  HIGH: "bg-warning/15 text-warning ring-warning/20",
  CRITICAL: "bg-destructive/15 text-destructive ring-destructive/20",
};

function FlagPill({ flag }: { flag: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ring-1 ring-inset",
        FLAG_TONE[flag] ?? "bg-muted text-muted-foreground ring-border",
      )}
    >
      {flag === "HIGH" ? "H · High" : flag === "LOW" ? "L · Low" : flag}
    </span>
  );
}

type Draft = { resultValue: string; resultFlag: string; resultNotes: string };

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
  const [results, setResults] = React.useState<Record<string, Draft>>(
    Object.fromEntries(
      items.map((i) => [
        i.id,
        {
          resultValue: i.resultValue ?? "",
          resultFlag: i.resultFlag ?? "",
          resultNotes: i.resultNotes ?? "",
        },
      ]),
    ),
  );

  const setR = (id: string, patch: Partial<Draft>) =>
    setResults((s) => ({ ...s, [id]: { ...s[id], ...patch } }));

  // When a value changes, auto-derive the flag from the reference range.
  const onValue = (item: Item, value: string) => {
    const suggested = computeFlag(value, item.test);
    setR(item.id, { resultValue: value, ...(suggested ? { resultFlag: suggested } : {}) });
  };

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
      resultNotes: results[i.id]?.resultNotes || undefined,
    }));
    fire("submit_results", { results: payload });
  };

  const entered = items.filter((i) => (results[i.id]?.resultValue ?? "").trim()).length;

  return (
    <div className="space-y-4">
      {editable && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/40 px-4 py-2.5">
          <span className="text-sm text-muted-foreground">
            <span className="font-semibold tabular-nums text-foreground">{entered}</span> of{" "}
            <span className="tabular-nums">{items.length}</span> results entered
          </span>
          <div className="h-1.5 w-32 overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${items.length ? (entered / items.length) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Test</TableHead>
              <TableHead className="hidden sm:table-cell">Specimen</TableHead>
              <TableHead>Reference range</TableHead>
              <TableHead>Result</TableHead>
              <TableHead>Flag</TableHead>
              {!editable && <TableHead>Status</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((it) => {
              const range = rangeLabel(it.test);
              const draft = results[it.id];
              const activeFlag = draft?.resultFlag || it.resultFlag || "";
              return (
                <TableRow key={it.id} className="hover:bg-transparent">
                  <TableCell className="align-top">
                    <div className="font-medium text-foreground">{it.test.name}</div>
                    {it.test.unit && (
                      <div className="text-xs text-muted-foreground">Unit: {it.test.unit}</div>
                    )}
                    {editable && (
                      <Input
                        className="mt-2 h-8 max-w-xs text-xs"
                        placeholder="Add a note (optional)…"
                        value={draft?.resultNotes ?? ""}
                        onChange={(e) => setR(it.id, { resultNotes: e.target.value })}
                      />
                    )}
                    {!editable && it.resultNotes && (
                      <div className="mt-1 text-xs text-muted-foreground">{it.resultNotes}</div>
                    )}
                  </TableCell>
                  <TableCell className="hidden align-top text-sm text-muted-foreground sm:table-cell">
                    {it.test.specimen ?? "—"}
                  </TableCell>
                  <TableCell className="align-top">
                    <span className="font-mono text-sm text-muted-foreground">{range ?? "—"}</span>
                  </TableCell>
                  <TableCell className="align-top">
                    {editable ? (
                      <div className="flex items-center gap-1.5">
                        <Input
                          className="w-24 tabular-nums"
                          placeholder="Value"
                          value={draft?.resultValue ?? ""}
                          onChange={(e) => onValue(it, e.target.value)}
                        />
                        {it.test.unit && (
                          <span className="text-xs text-muted-foreground">{it.test.unit}</span>
                        )}
                      </div>
                    ) : it.resultValue ? (
                      <span className="font-mono text-sm font-medium tabular-nums text-foreground">
                        {it.resultValue}
                        {it.test.unit ? ` ${it.test.unit}` : ""}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="align-top">
                    {editable ? (
                      <select
                        className={flagCls}
                        value={draft?.resultFlag ?? ""}
                        onChange={(e) => setR(it.id, { resultFlag: e.target.value })}
                      >
                        <option value="">Auto</option>
                        <option value="NORMAL">Normal</option>
                        <option value="LOW">Low</option>
                        <option value="HIGH">High</option>
                        <option value="CRITICAL">Critical</option>
                      </select>
                    ) : activeFlag ? (
                      <FlagPill flag={activeFlag} />
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  {!editable && (
                    <TableCell className="align-top">
                      <StatusBadge state={it.state} />
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {affordances.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {affordances.map((a) =>
            a.event === "submit_results" ? (
              <Button key={a.event} variant={variant(a.intent)} disabled={pending} onClick={submitResults}>
                {pending ? <Loader2 className="animate-spin" /> : <FlaskConical className="size-4" />}
                {a.label}
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
      )}
    </div>
  );
}
