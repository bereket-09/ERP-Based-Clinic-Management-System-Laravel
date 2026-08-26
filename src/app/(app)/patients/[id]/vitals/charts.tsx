"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const BRAND_PRIMARY = "#1a56b0";
const BRAND_SECONDARY = "#e0a112";

export interface VitalsPoint {
  label: string;
  temperatureC?: number | null;
  pulseBpm?: number | null;
  systolic?: number | null;
  diastolic?: number | null;
  spo2?: number | null;
  weightKg?: number | null;
}

const AXIS_PROPS = {
  stroke: "var(--muted-foreground)",
  fontSize: 12,
  tickLine: false,
  axisLine: false,
} as const;

function ChartTooltip({
  active,
  payload,
  label,
  unit,
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number | string; color?: string }>;
  label?: string | number;
  unit?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-md">
      <div className="mb-1 font-medium text-foreground">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-1.5 text-muted-foreground">
          <span
            className="inline-block size-2 rounded-full"
            style={{ background: p.color }}
          />
          <span className="text-foreground">
            {p.name ? `${p.name}: ` : ""}
            {p.value}
            {unit ? ` ${unit}` : ""}
          </span>
        </div>
      ))}
    </div>
  );
}

function ChartFrame({ children }: { children: React.ReactElement }) {
  return (
    <div className="h-60 w-full">
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
}

const GRID = (
  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
);

function SingleLineChart({
  data,
  dataKey,
  name,
  unit,
  color,
  domain,
}: {
  data: VitalsPoint[];
  dataKey: keyof VitalsPoint;
  name: string;
  unit?: string;
  color: string;
  domain?: [number | "auto", number | "auto"];
}) {
  return (
    <ChartFrame>
      <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -8 }}>
        {GRID}
        <XAxis dataKey="label" {...AXIS_PROPS} />
        <YAxis {...AXIS_PROPS} width={40} domain={domain ?? ["auto", "auto"]} />
        <Tooltip
          content={<ChartTooltip unit={unit} />}
          cursor={{ stroke: "var(--border)" }}
        />
        <Line
          type="monotone"
          dataKey={dataKey as string}
          name={name}
          stroke={color}
          strokeWidth={2}
          dot={{ r: 3, fill: color }}
          activeDot={{ r: 5 }}
          connectNulls
          isAnimationActive={false}
        />
      </LineChart>
    </ChartFrame>
  );
}

export function TemperatureChart({ data }: { data: VitalsPoint[] }) {
  return (
    <SingleLineChart
      data={data}
      dataKey="temperatureC"
      name="Temp"
      unit="°C"
      color={BRAND_PRIMARY}
    />
  );
}

export function PulseChart({ data }: { data: VitalsPoint[] }) {
  return (
    <SingleLineChart
      data={data}
      dataKey="pulseBpm"
      name="Pulse"
      unit="bpm"
      color={BRAND_SECONDARY}
    />
  );
}

export function Spo2Chart({ data }: { data: VitalsPoint[] }) {
  return (
    <SingleLineChart
      data={data}
      dataKey="spo2"
      name="SpO₂"
      unit="%"
      color={BRAND_PRIMARY}
      domain={[80, 100]}
    />
  );
}

export function WeightChart({ data }: { data: VitalsPoint[] }) {
  return (
    <SingleLineChart
      data={data}
      dataKey="weightKg"
      name="Weight"
      unit="kg"
      color={BRAND_SECONDARY}
    />
  );
}

export function BloodPressureChart({ data }: { data: VitalsPoint[] }) {
  return (
    <ChartFrame>
      <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -8 }}>
        {GRID}
        <XAxis dataKey="label" {...AXIS_PROPS} />
        <YAxis {...AXIS_PROPS} width={40} domain={["auto", "auto"]} />
        <Tooltip
          content={<ChartTooltip unit="mmHg" />}
          cursor={{ stroke: "var(--border)" }}
        />
        <Line
          type="monotone"
          dataKey="systolic"
          name="Systolic"
          stroke={BRAND_PRIMARY}
          strokeWidth={2}
          dot={{ r: 3, fill: BRAND_PRIMARY }}
          activeDot={{ r: 5 }}
          connectNulls
          isAnimationActive={false}
        />
        <Line
          type="monotone"
          dataKey="diastolic"
          name="Diastolic"
          stroke={BRAND_SECONDARY}
          strokeWidth={2}
          dot={{ r: 3, fill: BRAND_SECONDARY }}
          activeDot={{ r: 5 }}
          connectNulls
          isAnimationActive={false}
        />
      </LineChart>
    </ChartFrame>
  );
}
