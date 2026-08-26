"use client";

import { useId } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type SparkPoint = { label: string; value: number };

/**
 * A soft blue area sparkline for "visits over the last N days". Reads brand
 * tokens through CSS variables so it tracks light/dark automatically. Client
 * component (recharts renders in the browser).
 */
export function Sparkline({
  data,
  height = 132,
}: {
  data: SparkPoint[];
  height?: number;
}) {
  const gradientId = useId();

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: 4 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.28} />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            dy={6}
            interval="preserveStartEnd"
          />
          <YAxis hide domain={[0, "dataMax + 2"]} />
          <Tooltip
            cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
            contentStyle={{
              background: "var(--popover)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              boxShadow: "0 10px 30px -12px rgba(14,26,47,0.35)",
              fontSize: 12,
              padding: "8px 12px",
              color: "var(--popover-foreground)",
            }}
            labelStyle={{ color: "var(--muted-foreground)", marginBottom: 2 }}
            itemStyle={{ color: "var(--foreground)", fontWeight: 600 }}
            formatter={(value) => [`${value}`, "Visits"]}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="var(--primary)"
            strokeWidth={2.25}
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={{
              r: 4,
              fill: "var(--primary)",
              stroke: "var(--card)",
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
