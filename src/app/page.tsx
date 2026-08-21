import Link from "next/link";
import {
  ArrowRight,
  Stethoscope,
  FlaskConical,
  Pill,
  BedDouble,
  Send,
  Boxes,
  ShieldCheck,
  Workflow,
  Wifi,
  Activity,
  CheckCircle2,
  Layers,
} from "lucide-react";
import { LogoMark } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { ROLE_LABELS } from "@/lib/rbac";

const MODULES = [
  { icon: Stethoscope, title: "Clinical workflow", body: "Reception → triage → consultation → lab → pharmacy, driven by a state machine that always shows the next right action." },
  { icon: FlaskConical, title: "Laboratory", body: "Order tests, collect specimens, enter results with reference ranges, and route findings back to the doctor." },
  { icon: Pill, title: "Pharmacy & stock", body: "Real batch-and-expiry inventory, dispensing that decrements stock atomically, and low-stock alerts." },
  { icon: BedDouble, title: "Wards & admissions", body: "Admit students who need overnight observation, manage beds, and discharge with a summary." },
  { icon: Send, title: "Referrals", body: "Refer complex cases to external hospitals with a proper printable referral letter." },
  { icon: Boxes, title: "HR & store", body: "Leave workflow with on-leave login lockout, staff records, and asset/property management." },
];

const PILLARS = [
  { icon: Workflow, title: "Backend-driven UI", body: "The server computes which actions each role may take right now — the interface renders exactly those, nothing more." },
  { icon: ShieldCheck, title: "Secure by design", body: "Role-based access control, audited state transitions, and modern authentication throughout." },
  { icon: Wifi, title: "On-prem & offline-ready", body: "Runs on a campus server, installs as an app, and keeps core screens working through network blips." },
];

const METRICS = [
  { value: "8", label: "staff roles, each with a tailored workspace" },
  { value: "6", label: "clinical modules on one shared record" },
  { value: "1", label: "medical record per student, everywhere" },
  { value: "On-prem", label: "runs on the campus server, no cloud" },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-3.5">
          <div className="flex items-center gap-2.5">
            <LogoMark className="size-9" />
            <span className="font-semibold tracking-tight">DDU Clinic</span>
          </div>
          <nav className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/student-login">Student portal</Link>
            </Button>
            <Button asChild variant="primary" size="sm">
              <Link href="/login">Staff sign in</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="bg-brand-gradient relative overflow-hidden text-white">
        <div className="pointer-events-none absolute -right-32 -top-24 size-[30rem] rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 left-1/4 size-96 rounded-full bg-gold/20 blur-3xl" />
        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div className="min-w-0">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium tracking-wide text-white/80 ring-1 ring-white/15">
              <span className="size-1.5 rounded-full bg-gold" />
              Dire Dawa University · Student Clinic Center
            </p>
            <h1 className="max-w-2xl text-4xl font-semibold leading-[1.08] tracking-tight text-balance sm:text-5xl">
              One secure platform for the entire campus clinic.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/75">
              From the front desk to the lab, pharmacy, wards and management — digitise the whole
              student health journey with real-time queues, guided workflows and printable medical
              documents.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="group bg-white text-brand-700 shadow-sm hover:bg-white/90">
                <Link href="/login">
                  Staff sign in
                  <span className="ml-1 flex size-6 items-center justify-center rounded-full bg-brand-700/10 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5">
                    <ArrowRight className="size-3.5" />
                  </span>
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white">
                <Link href="/student-login">Student portal</Link>
              </Button>
            </div>
            <dl className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-white/70">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-gold" /> Role-based access control
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-gold" /> Audited every step
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-gold" /> Installs as an app
              </div>
            </dl>
          </div>

          {/* Faux product window — a dashboard sketch built from divs */}
          <AppWindowMock />
        </div>
      </section>

      {/* ── Metrics band ─────────────────────────────────────────────────── */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-px overflow-hidden px-6 py-2 sm:grid-cols-4">
          {METRICS.map((m) => (
            <div key={m.label} className="px-2 py-6 text-center sm:px-4">
              <div className="text-3xl font-semibold tracking-tight text-primary">{m.value}</div>
              <p className="mx-auto mt-1.5 max-w-[16ch] text-xs leading-snug text-muted-foreground">
                {m.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pillars ──────────────────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-6xl px-6 py-20">
        <div className="max-w-2xl">
          <p className="mb-3 inline-flex rounded-full bg-accent px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-accent-foreground">
            Why it holds up
          </p>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Built for a real clinic, not a demo.
          </h2>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {PILLARS.map((p) => (
            <article
              key={p.title}
              className="group rounded-2xl border border-border bg-card p-6 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:shadow-[0_1px_2px_rgba(14,26,47,0.05),0_16px_36px_-20px_rgba(14,26,47,0.4)]"
            >
              <span className="flex size-11 items-center justify-center rounded-xl bg-accent text-accent-foreground transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105">
                <p.icon className="size-5" />
              </span>
              <h3 className="mt-4 font-semibold tracking-tight">{p.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ── Modules ──────────────────────────────────────────────────────── */}
      <section className="border-y border-border bg-muted/40">
        <div className="mx-auto w-full max-w-6xl px-6 py-20">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="mb-3 inline-flex rounded-full bg-accent px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-accent-foreground">
                The modules
              </p>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Everything the clinic runs on.
              </h2>
              <p className="mt-2 text-muted-foreground">
                Purpose-built for every role, working together on one shared record.
              </p>
            </div>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {MODULES.map((m, i) => (
              <article
                key={m.title}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:shadow-[0_1px_2px_rgba(14,26,47,0.05),0_16px_36px_-20px_rgba(14,26,47,0.4)]"
              >
                <span className="pointer-events-none absolute right-5 top-5 font-mono text-xs text-muted-foreground/40">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex size-11 items-center justify-center rounded-xl bg-brand-50 text-primary transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105">
                  <m.icon className="size-5" />
                </span>
                <h3 className="mt-4 font-semibold tracking-tight">{m.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{m.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Roles strip ──────────────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-6xl px-6 py-20">
        <div className="max-w-2xl">
          <p className="mb-3 inline-flex rounded-full bg-accent px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-accent-foreground">
            One platform, every desk
          </p>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            A tailored workspace for each role.
          </h2>
          <p className="mt-2 text-muted-foreground">
            Everyone signs into the same system and lands on a command center scoped to their job.
          </p>
        </div>
        <div className="mt-8 flex flex-wrap gap-2.5">
          {Object.values(ROLE_LABELS).map((label) => (
            <span
              key={label}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-sm font-medium text-foreground"
            >
              <span className="size-1.5 rounded-full bg-gold" />
              {label}
            </span>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-6xl px-6 pb-24">
        <div className="bg-brand-gradient relative overflow-hidden rounded-3xl px-8 py-14 text-center text-white sm:px-16">
          <div className="pointer-events-none absolute -left-20 -top-20 size-72 rounded-full bg-gold/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -right-16 size-80 rounded-full bg-white/10 blur-3xl" />
          <div className="relative">
            <h2 className="mx-auto max-w-xl text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
              Ready to run the clinic from one screen?
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-white/75">
              Staff sign in to their workspace, students use the self-service portal for records and
              appointments.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" className="group bg-white text-brand-700 hover:bg-white/90">
                <Link href="/login">
                  Staff sign in
                  <span className="ml-1 flex size-6 items-center justify-center rounded-full bg-brand-700/10 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5">
                    <ArrowRight className="size-3.5" />
                  </span>
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white">
                <Link href="/student-login">Open student portal</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <footer className="mt-auto border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-6 py-8 text-sm text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2">
            <LogoMark className="size-6" />
            <span>DDU Clinic · Student Clinic Center</span>
          </div>
          <span>© {new Date().getFullYear()} Dire Dawa University</span>
        </div>
      </footer>
    </div>
  );
}

/* ── Faux product window: a dashboard sketch, entirely from divs ──────────── */
function AppWindowMock() {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute -inset-4 rounded-[2rem] bg-white/5 ring-1 ring-white/10" />
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0c1a33] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.6)]">
        {/* title bar */}
        <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
          <span className="size-2.5 rounded-full bg-white/20" />
          <span className="size-2.5 rounded-full bg-white/20" />
          <span className="size-2.5 rounded-full bg-white/20" />
          <div className="ml-3 h-5 flex-1 rounded-md bg-white/5" />
        </div>
        <div className="flex">
          {/* mini sidebar */}
          <div className="hidden w-14 shrink-0 flex-col items-center gap-3 border-r border-white/10 py-4 sm:flex">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <LogoMark className="size-5 bg-transparent shadow-none" />
            </span>
            {[Activity, Stethoscope, FlaskConical, Pill, Layers].map((Icon, i) => (
              <span
                key={i}
                className={`flex size-8 items-center justify-center rounded-lg ${i === 0 ? "bg-white/10 text-white" : "text-white/40"}`}
              >
                <Icon className="size-4" />
              </span>
            ))}
          </div>
          {/* content */}
          <div className="min-w-0 flex-1 space-y-3 p-4">
            {/* greeting row */}
            <div className="flex items-center justify-between">
              <div className="space-y-1.5">
                <div className="h-3 w-28 rounded bg-white/15" />
                <div className="h-2 w-20 rounded bg-white/10" />
              </div>
              <div className="h-6 w-16 rounded-full bg-gold/25" />
            </div>
            {/* kpi tiles */}
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { v: "12", c: "text-white" },
                { v: "7", c: "text-gold" },
                { v: "23", c: "text-white" },
              ].map((k, i) => (
                <div key={i} className="rounded-lg bg-white/5 p-2.5 ring-1 ring-white/5">
                  <div className="mb-1.5 size-4 rounded bg-white/15" />
                  <div className={`text-lg font-semibold tabular-nums ${k.c}`}>{k.v}</div>
                  <div className="mt-1 h-1.5 w-10 rounded bg-white/10" />
                </div>
              ))}
            </div>
            {/* chart + funnel */}
            <div className="grid grid-cols-5 gap-2.5">
              <div className="col-span-3 rounded-lg bg-white/5 p-3 ring-1 ring-white/5">
                <div className="mb-2 h-2 w-16 rounded bg-white/10" />
                <div className="flex h-16 items-end gap-1.5">
                  {[40, 62, 48, 78, 55, 88, 70].map((h, i) => (
                    <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-primary/30 to-primary" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
              <div className="col-span-2 space-y-2 rounded-lg bg-white/5 p-3 ring-1 ring-white/5">
                {[90, 65, 45, 30].map((w, i) => (
                  <div key={i} className="space-y-1">
                    <div className="h-1.5 rounded-full" style={{ width: `${w}%`, background: i === 3 ? "var(--gold)" : "rgba(255,255,255,0.35)" }} />
                  </div>
                ))}
              </div>
            </div>
            {/* queue list */}
            <div className="space-y-2 rounded-lg bg-white/5 p-3 ring-1 ring-white/5">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <span className="size-6 shrink-0 rounded-full bg-white/15" />
                  <div className="flex-1 space-y-1">
                    <div className="h-2 w-24 rounded bg-white/15" />
                    <div className="h-1.5 w-16 rounded bg-white/10" />
                  </div>
                  <span className="h-4 w-12 rounded-full bg-primary/40" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
