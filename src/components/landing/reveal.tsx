"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Gentle scroll-reveal wrapper. Elements fade + slide up once as they enter the
 * viewport. All motion lives in a `@media (prefers-reduced-motion: no-preference)`
 * block in the landing page's <style> tag, so readers who prefer reduced motion
 * simply see the content in place — this component only toggles `is-visible`.
 */
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  /** Stagger, in ms, applied as transition-delay. */
  delay?: number;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [shown, setShown] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn("reveal", shown && "is-visible", className)}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
