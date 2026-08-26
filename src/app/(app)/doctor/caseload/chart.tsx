"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Brand palette — blue primary, gold accent. Dark-mode-safe via CSS vars.
const BRAND = "#1a56b0";
const GOLD = "#e0a112";

const AXIS_TICK = { fontSize: 11, fill: "var(--muted-foreground)" };

const TOOLTIP_STYLE = {
  borderRadius: 12,
  border: "1px solid var(--border)",
  background: "var(--card)",
  color: "var(--card-foreground)",
  fontSize: 12,
  boxShadow: "0 8px 24px -12px rgba(0,0,0,0.25)",
} as const;

export type DayPoint = { label: string; value: number };

/** Consultations completed over the last 14 days — daily bars. */
export function ConsultationsBarChart({ data }: { data: DayPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="label"
          tick={AXIS_TICK}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={AXIS_TICK}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
          width={32}
        />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          cursor={{ fill: `${GOLD}1f` }}
          labelStyle={{ color: "var(--foreground)", fontWeight: 600 }}
        />
        <Bar dataKey="value" name="Consultations" radius={[6, 6, 0, 0]} fill={BRAND} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  );
}
