"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

/**
 * Ticking wall clock for the lobby display. Renders time + date and
 * updates every second. Hydration-safe: starts empty, fills on mount.
 */
export function LiveClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const time = now
    ? now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : "--:--:--";
  const date = now
    ? now.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })
    : "";

  return (
    <div className="text-right leading-none">
      <div className="font-mono text-4xl font-bold tabular-nums tracking-tight sm:text-5xl">
        {time}
      </div>
      <div className="mt-2 text-base font-medium text-white/70 sm:text-lg">{date}</div>
    </div>
  );
}

/**
 * Invisible helper that refreshes the server component on an interval so the
 * board stays current without a full page reload. Data lives on the server;
 * this only triggers a soft re-render via router.refresh().
 */
export function AutoRefresh({ intervalMs = 20_000 }: { intervalMs?: number }) {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setRefreshing(true);
      router.refresh();
      const t = setTimeout(() => setRefreshing(false), 900);
      return () => clearTimeout(t);
    }, intervalMs);
    return () => clearInterval(id);
  }, [router, intervalMs]);

  return (
    <div
      className="flex items-center gap-2 text-sm text-white/60"
      aria-live="polite"
      aria-label="Board auto-refreshes every 20 seconds"
    >
      <RefreshCw className={refreshing ? "size-4 animate-spin" : "size-4"} />
      <span>Live · updates every 20s</span>
    </div>
  );
}
