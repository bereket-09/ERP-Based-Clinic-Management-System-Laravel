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
} from "lucide-react";
import { LogoMark } from "@/components/brand";
import { Button } from "@/components/ui/button";

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

export default function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2.5">
          <LogoMark className="size-9" />
          <span className="font-semibold">DDU Clinic</span>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/student-login">Student portal</Link>
          </Button>
          <Button asChild variant="primary" size="sm">
            <Link href="/login">Staff sign in</Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-brand-gradient relative overflow-hidden text-white">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <p className="mb-4 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80">
            Dire Dawa University · Student Clinic Center
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-balance sm:text-5xl">
            One secure platform for the entire campus clinic.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-white/80">
            From the front desk to the lab, pharmacy, wards and management — digitise the whole
            student health journey with real-time queues, guided workflows and printable medical
            documents.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-white text-brand-700 hover:bg-white/90">
              <Link href="/login">
                Staff sign in <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20">
              <Link href="/student-login">Student portal</Link>
            </Button>
          </div>
        </div>
        <div className="pointer-events-none absolute -right-40 top-0 size-96 rounded-full bg-white/10 blur-3xl" />
      </section>

      {/* Pillars */}
      <section className="mx-auto w-full max-w-6xl px-6 py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {PILLARS.map((p) => (
            <div key={p.title} className="rounded-xl border border-border bg-card p-6 card-shadow">
              <span className="flex size-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <p.icon className="size-5" />
              </span>
              <h3 className="mt-4 font-semibold">{p.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Modules */}
      <section className="border-t border-border bg-muted/40">
        <div className="mx-auto w-full max-w-6xl px-6 py-16">
          <h2 className="text-2xl font-semibold tracking-tight">Everything the clinic runs on</h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Purpose-built modules for every role, working together on one shared record.
          </p>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {MODULES.map((m) => (
              <div key={m.title} className="rounded-xl border border-border bg-card p-6 card-shadow">
                <m.icon className="size-6 text-primary" />
                <h3 className="mt-3 font-semibold">{m.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{m.body}</p>
              </div>
            ))}
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
