"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Green brand palette — shared across every chart in this module.
const BRAND = "#1a56b0";
const BRAND_MID = "#4076c9";
const BRAND_SOFT = "#e0a112";
const SERIES = [BRAND, BRAND_MID, BRAND_SOFT];

const GRID = "var(--border)";
const AXIS_TICK = { fontSize: 12, fill: "var(--muted-foreground)" };

const TOOLTIP_STYLE = {
  borderRadius: 12,
  border: "1px solid var(--border)",
  background: "var(--card)",
  color: "var(--card-foreground)",
  fontSize: 12,
  boxShadow: "0 8px 24px -12px rgba(0,0,0,0.25)",
} as const;

const CURSOR_FILL = "rgba(22, 160, 133, 0.08)";

export type SeriesPoint = { label: string; value: number };

/** Visits over the last 14 days — smooth area trend. */
export function VisitsTrendChart({ data }: { data: SeriesPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
        <defs>
          <linearGradient id="visitsFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={BRAND} stopOpacity={0.35} />
            <stop offset="100%" stopColor={BRAND} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis dataKey="label" tick={AXIS_TICK} tickLine={false} axisLine={false} interval="preserveStartEnd" />
        <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} allowDecimals={false} width={32} />
        <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ stroke: BRAND, strokeWidth: 1, strokeDasharray: "4 4" }} />
        <Area
          type="monotone"
          dataKey="value"
          name="Visits"
          stroke={BRAND}
          strokeWidth={2}
          fill="url(#visitsFill)"
          dot={false}
          activeDot={{ r: 4, fill: BRAND }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/** Vertical bar chart — used for visits-by-state and staff-by-role. */
export function CategoryBarChart({ data }: { data: SeriesPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis
          dataKey="label"
          tick={AXIS_TICK}
          tickLine={false}
          axisLine={false}
          interval={0}
          angle={-20}
          textAnchor="end"
          height={64}
        />
        <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} allowDecimals={false} width={32} />
        <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: CURSOR_FILL }} />
        <Bar dataKey="value" name="Count" radius={[6, 6, 0, 0]} maxBarSize={48}>
          {data.map((_, i) => (
            <Cell key={i} fill={SERIES[i % SERIES.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Horizontal ranked bar chart — used for top diagnoses. */
export function RankedBarChart({ data }: { data: SeriesPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 28, left: 8, bottom: 4 }}
        barCategoryGap={8}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} horizontal={false} />
        <XAxis type="number" tick={AXIS_TICK} tickLine={false} axisLine={false} allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="label"
          tick={AXIS_TICK}
          tickLine={false}
          axisLine={false}
          width={140}
        />
        <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: CURSOR_FILL }} />
        <Bar dataKey="value" name="Cases" radius={[0, 6, 6, 0]} fill={BRAND} maxBarSize={22}>
          <LabelList dataKey="value" position="right" style={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Compact horizontal bar chart for small throughput panels. */
export function MiniBarChart({ data, color = BRAND }: { data: SeriesPoint[]; color?: string }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 24, left: 8, bottom: 0 }} barCategoryGap={6}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} horizontal={false} />
        <XAxis type="number" tick={AXIS_TICK} tickLine={false} axisLine={false} allowDecimals={false} hide />
        <YAxis
          type="category"
          dataKey="label"
          tick={AXIS_TICK}
          tickLine={false}
          axisLine={false}
          width={128}
        />
        <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: CURSOR_FILL }} />
        <Bar dataKey="value" name="Orders" radius={[0, 6, 6, 0]} fill={color} maxBarSize={20}>
          <LabelList dataKey="value" position="right" style={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
