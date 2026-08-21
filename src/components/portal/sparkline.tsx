import { cn } from "@/lib/utils";

export type SparkPoint = { value: number; label?: string };

/**
 * Small, dependency-free trend line rendered as inline SVG. Server-safe (no
 * client interactivity). Uses currentColor so callers can theme via text-*.
 */
export function Sparkline({
  points,
  width = 220,
  height = 48,
  className,
}: {
  points: SparkPoint[];
  width?: number;
  height?: number;
  className?: string;
}) {
  if (points.length < 2) return null;

  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pad = 4;
  const innerW = width - pad * 2;
  const innerH = height - pad * 2;

  const coords = points.map((p, i) => {
    const x = pad + (points.length === 1 ? innerW / 2 : (i / (points.length - 1)) * innerW);
    const y = pad + innerH - ((p.value - min) / range) * innerH;
    return [x, y] as const;
  });

  const line = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line} L${coords[coords.length - 1][0].toFixed(1)},${height - pad} L${coords[0][0].toFixed(1)},${height - pad} Z`;
  const [lastX, lastY] = coords[coords.length - 1];

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className={cn("text-primary", className)}
      role="img"
      aria-hidden
      preserveAspectRatio="none"
    >
      <path d={area} fill="currentColor" opacity={0.1} />
      <path d={line} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lastX} cy={lastY} r={3} fill="currentColor" />
    </svg>
  );
}
