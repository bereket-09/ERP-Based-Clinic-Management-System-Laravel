"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Gentle scroll-reveal wrapper. Content is visible by DEFAULT — a `.reveal` with
 * no extra class simply shows. After first paint we only "arm" (hide + prepare to
 * animate) elements that sit BELOW the fold; those fade + slide up as they scroll
 * into view. Anything on screen at load — the hero, above-the-fold content — is
 * never armed, so it paints immediately and a slow or failed hydration can never
 * leave the page blank. Readers who prefer reduced motion always see the content
 * in place (all motion lives in a `prefers-reduced-motion: no-preference` block in
 * the landing page's <style>).
 */
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  /** Stagger, in ms, applied as transition-delay once armed. */
  delay?: number;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [armed, setArmed] = React.useState(false);
  const [shown, setShown] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    let io: IntersectionObserver | undefined;
    // Measure on the next frame so layout is settled — measuring during
    // hydration can return a zero rect and wrongly hide everything.
    const raf = requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 0;
      // Degenerate / not-yet-laid-out measurement → leave it visible.
      if (rect.height === 0 && rect.width === 0) return;

      const docTop = rect.top + window.scrollY;
      const onScreenNow = rect.top < vh && rect.bottom > 0;
      // Visible at load (first screenful, or already scrolled into view) →
      // leave it painted; never animate it in from hidden.
      if (docTop < vh || onScreenNow) return;

      // Genuinely below the fold → hide, then reveal as it scrolls into view.
      setArmed(true);
      io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              setShown(true);
              io?.disconnect();
              break;
            }
          }
        },
        { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
      );
      io.observe(el);
    });

    return () => {
      cancelAnimationFrame(raf);
      io?.disconnect();
    };
  }, []);

  return (
    <div
      ref={ref}
      className={cn("reveal", armed && "reveal-armed", shown && "is-visible", className)}
      style={armed && delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
