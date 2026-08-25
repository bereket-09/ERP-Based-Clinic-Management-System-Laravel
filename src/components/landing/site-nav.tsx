"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LogoMark } from "@/components/brand";

const LINKS = [
  { href: "#services", label: "Care" },
  { href: "#visit", label: "Your visit" },
  { href: "#wellness", label: "Wellness" },
  { href: "#numbers", label: "Our clinic" },
];

/**
 * Floating glass "island" nav, detached from the top. On mobile the hamburger
 * fluidly morphs into an X and opens a full-screen blurred overlay whose links
 * reveal with a staggered rise. Motion uses custom spring-like easing.
 */
export function SiteNav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-40 flex justify-center">
      <nav className="pointer-events-auto mx-4 mt-5 flex w-full max-w-5xl items-center justify-between gap-4 rounded-full border border-white/15 bg-white/70 px-3 py-2.5 shadow-[0_8px_40px_-12px_rgba(12,31,61,0.35)] backdrop-blur-xl dark:border-white/10 dark:bg-[#0c1f3d]/60 sm:px-5">
        <Link href="/" className="flex items-center gap-2.5 pl-1">
          <LogoMark className="size-8" />
          <span className="text-[15px] font-semibold tracking-tight text-foreground">DDU Clinic</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-full px-3.5 py-1.5 text-sm text-muted-foreground transition-colors duration-300 hover:bg-foreground/5 hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/student-login"
            className="hidden rounded-full px-4 py-2 text-sm font-medium text-foreground transition-colors duration-300 hover:bg-foreground/5 sm:inline-flex"
          >
            Student portal
          </Link>
          <Link
            href="/login"
            className="group hidden items-center gap-2 rounded-full bg-[#0c1f3d] py-2 pl-4 pr-2 text-sm font-medium text-white transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97] sm:inline-flex dark:bg-primary"
          >
            Staff sign in
            <span className="flex size-6 items-center justify-center rounded-full bg-white/15 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5">
              <svg viewBox="0 0 24 24" fill="none" className="size-3.5" stroke="currentColor" strokeWidth={1.5}>
                <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </Link>

          {/* Hamburger → X */}
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            className="relative flex size-9 items-center justify-center rounded-full bg-foreground/5 md:hidden"
          >
            <span
              className={`absolute h-[1.5px] w-4 rounded bg-foreground transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${open ? "rotate-45" : "-translate-y-1"}`}
            />
            <span
              className={`absolute h-[1.5px] w-4 rounded bg-foreground transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${open ? "-rotate-45" : "translate-y-1"}`}
            />
          </button>
        </div>
      </nav>

      {/* Mobile overlay */}
      <div
        className={`pointer-events-auto fixed inset-0 z-30 flex flex-col bg-white/85 backdrop-blur-2xl transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] md:hidden dark:bg-[#0a1120]/90 ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
      >
        <div className="flex flex-col gap-2 px-8 pt-28">
          {LINKS.map((l, i) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={`text-3xl font-semibold tracking-tight text-foreground transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${open ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
              style={{ transitionDelay: `${open ? 120 + i * 60 : 0}ms` }}
            >
              {l.label}
            </a>
          ))}
          <div className="mt-8 flex flex-col gap-3">
            <Link href="/student-login" onClick={() => setOpen(false)} className="rounded-full border border-border bg-card px-6 py-3.5 text-center text-base font-medium text-foreground">
              Student portal
            </Link>
            <Link href="/login" onClick={() => setOpen(false)} className="rounded-full bg-[#0c1f3d] px-6 py-3.5 text-center text-base font-medium text-white dark:bg-primary">
              Staff sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
