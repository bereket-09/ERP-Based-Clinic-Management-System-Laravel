import { StatusBadge } from "@/components/status-badge";

interface LabItem {
  id: string;
  state: string;
  resultValue: string | null;
  resultFlag: string | null;
  resultNotes?: string | null;
  test: { name: string; unit: string | null; refRangeText: string | null; refRangeLow: number | null; refRangeHigh: number | null };
}

export function LabItemsList({ items }: { items: LabItem[] }) {
  if (items.length === 0) return <p className="text-sm text-muted-foreground">No tests.</p>;
  return (
    <ul className="divide-y divide-border">
      {items.map((it) => {
        const range =
          it.test.refRangeText ??
          (it.test.refRangeLow != null && it.test.refRangeHigh != null
            ? `${it.test.refRangeLow}–${it.test.refRangeHigh}`
            : null);
        return (
          <li key={it.id} className="flex items-center justify-between gap-3 py-2 text-sm">
            <div className="min-w-0">
              <div className="font-medium">{it.test.name}</div>
              {range && <div className="text-xs text-muted-foreground">Ref: {range}{it.test.unit ? ` ${it.test.unit}` : ""}</div>}
              {it.resultNotes && <div className="text-xs text-muted-foreground">{it.resultNotes}</div>}
            </div>
            <div className="flex items-center gap-2 text-right">
              {it.resultValue ? (
                <span className="font-mono text-sm">
                  {it.resultValue}
                  {it.test.unit ? ` ${it.test.unit}` : ""}
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">pending</span>
              )}
              {it.resultFlag && <StatusBadge state={it.resultFlag} />}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

interface DrugItem {
  id: string;
  state: string;
  dose: string | null;
  frequency: string | null;
  duration: string | null;
  quantity: number;
  dispensedQty: number;
  instructions?: string | null;
  medication: { name: string; strength: string | null; form: string | null };
}

export function DrugItemsList({ items }: { items: DrugItem[] }) {
  if (items.length === 0) return <p className="text-sm text-muted-foreground">No medications.</p>;
  return (
    <ul className="divide-y divide-border">
      {items.map((it) => (
        <li key={it.id} className="flex items-center justify-between gap-3 py-2 text-sm">
          <div className="min-w-0">
            <div className="font-medium">
              {it.medication.name} {it.medication.strength}
              <span className="ml-1 text-xs font-normal text-muted-foreground">{it.medication.form}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {[it.dose, it.frequency, it.duration].filter(Boolean).join(" · ")}
              {it.instructions ? ` — ${it.instructions}` : ""}
            </div>
          </div>
          <div className="flex items-center gap-2 text-right">
            <span className="text-xs text-muted-foreground">
              {it.dispensedQty}/{it.quantity}
            </span>
            <StatusBadge state={it.state} />
          </div>
        </li>
      ))}
    </ul>
  );
}
