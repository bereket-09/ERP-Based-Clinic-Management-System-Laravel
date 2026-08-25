import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BedDouble,
  CalendarHeart,
  CheckCircle2,
  ClipboardList,
  Clock,
  FlaskConical,
  FolderHeart,
  HeartHandshake,
  HeartPulse,
  Mail,
  MapPin,
  Phone,
  Pill,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UserPlus,
  Users,
} from "lucide-react";
import { LogoMark } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/landing/reveal";

/* ── Content ──────────────────────────────────────────────────────────────
   Warm, student-facing copy adapted from the legacy DDU Clinic homepage.
   Figures are representative of a typical academic year and are framed as such. */

const SERVICES = [
  {
    icon: Stethoscope,
    title: "General consultation",
    body: "Walk in or book ahead. A clinician listens, examines you gently and explains what's going on and what happens next — no rushing.",
  },
  {
    icon: FlaskConical,
    title: "Laboratory & tests",
    body: "On-site blood work and routine screening, with results returned quickly to the same clinician who saw you.",
  },
  {
    icon: Pill,
    title: "Pharmacy & dispensing",
    body: "Your prescription is filled right here on campus, with clear, patient guidance on how to take each medicine safely.",
  },
  {
    icon: BedDouble,
    title: "Wards & observation",
    body: "A quiet bed to rest, take fluids or be watched over for a while — until you feel steady enough to head home.",
  },
  {
    icon: HeartHandshake,
    title: "Wellness & counseling",
    body: "Confidential support for stress, anxiety and the weight of student life. Someone to talk to, whenever it gets heavy.",
  },
  {
    icon: CalendarHeart,
    title: "Referrals & follow-up",
    body: "When you need a specialist, we arrange the referral to partner hospitals and stay with you through the follow-up.",
  },
];

const STATS = [
  { icon: Users, value: "15,000+", label: "students & staff cared for" },
  { icon: HeartPulse, value: "10+ yrs", label: "looking after the campus" },
  { icon: Activity, value: "40,000+", label: "visits every year" },
  { icon: Clock, value: "24/7", label: "emergency & ambulance" },
];

const JOURNEY = [
  {
    icon: UserPlus,
    step: "01",
    title: "Come in & register",
    body: "Reception opens your record in a moment and points you to the right room. No long forms, no queues across town.",
  },
  {
    icon: Stethoscope,
    step: "02",
    title: "Sit with a clinician",
    body: "You'll be examined, listened to, and told plainly what's happening — and what the plan is to get you well.",
  },
  {
    icon: FlaskConical,
    step: "03",
    title: "Tests & medicine",
    body: "Any tests are run on-site and your medicines are dispensed here, all linked to today's visit.",
  },
  {
    icon: FolderHeart,
    step: "04",
    title: "Kept safe for next time",
    body: "Everything is saved to your history, so whoever sees you next already knows your story.",
  },
];

const REASSURE = [
  { icon: ShieldCheck, text: "Your records stay private and secure" },
  { icon: HeartHandshake, text: "Kind, unhurried, student-friendly care" },
  { icon: CheckCircle2, text: "Open to every student & staff member" },
];

const CONTACT = [
  { icon: Phone, label: "Call the clinic", value: "+251-915-15-15-15", href: "tel:+251915151515" },
  { icon: Mail, label: "Email us", value: "DDUClinic@gmail.com", href: "mailto:DDUClinic@gmail.com?subject=Clinic%20Enquiry" },
  { icon: MapPin, label: "Find us", value: "Dire Dawa University, Ethiopia", href: undefined },
  { icon: Clock, label: "Opening hours", value: "Mon–Fri 8:00–17:00 · Emergency 24/7", href: undefined },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <LandingMotionStyles />

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-3.5">
          <div className="flex items-center gap-2.5">
            <LogoMark className="size-9" />
            <div className="leading-tight">
              <div className="text-[15px] font-semibold tracking-tight">DDU Clinic Center</div>
              <div className="hidden text-[11px] text-muted-foreground sm:block">Dire Dawa University</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="mr-1 hidden items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success sm:inline-flex">
              <span className="anim-pulse-dot size-1.5 rounded-full bg-success" /> We&rsquo;re open
            </span>
            <Button asChild variant="ghost" size="sm">
              <Link href="/student-login">Student portal</Link>
            </Button>
            <Button asChild variant="primary" size="sm">
              <Link href="/login">Staff sign in</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="bg-brand-gradient relative overflow-hidden text-white">
        {/* softly drifting gradient blobs */}
        <div className="anim-blob pointer-events-none absolute -right-32 -top-24 size-[32rem] rounded-full bg-white/10 blur-3xl" />
        <div className="anim-blob-2 pointer-events-none absolute -bottom-44 left-1/4 size-[26rem] rounded-full bg-gold/25 blur-3xl" />
        <div className="anim-blob pointer-events-none absolute -left-24 top-1/3 size-80 rounded-full bg-brand-400/25 blur-3xl" />

        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div className="min-w-0 [animation:ddu-rise_.8s_cubic-bezier(.32,.72,0,1)_both]">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium tracking-wide text-white/85 ring-1 ring-white/15">
              <span className="anim-pulse-dot size-1.5 rounded-full bg-gold" />
              Dire Dawa University · Student Clinic Center
            </p>
            <h1 className="max-w-2xl text-4xl font-semibold leading-[1.08] tracking-tight text-balance sm:text-5xl">
              Feeling unwell? You&rsquo;re in good hands.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/80">
              Your campus clinic is a short walk away and here whenever you need us — for a fever, a
              worry, a check-up or an emergency. Warm, unhurried care, so you can rest and get back
              to being a student.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="group bg-white text-brand-700 shadow-sm hover:bg-white/90">
                <Link href="/student-login">
                  Student portal
                  <span className="ml-1 flex size-6 items-center justify-center rounded-full bg-brand-700/10 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5">
                    <ArrowRight className="size-3.5" />
                  </span>
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white">
                <Link href="/login">Staff sign in</Link>
              </Button>
            </div>
            <dl className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-white/75">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-gold" /> Open to all students &amp; staff
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-gold" /> Emergency care 24/7
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-gold" /> One caring, connected record
              </div>
            </dl>
          </div>

          <HeroVisual />
        </div>
      </section>

      {/* ── Care in numbers ──────────────────────────────────────────────── */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto w-full max-w-6xl px-6 py-12">
          <Reveal>
            <p className="mb-7 text-center text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Care, in numbers
            </p>
          </Reveal>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {STATS.map((s, i) => (
              <Reveal key={s.label} delay={i * 90}>
                <div className="text-center">
                  <span className="mx-auto flex size-11 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                    <s.icon className="size-5" />
                  </span>
                  <div className="mt-3 text-2xl font-semibold tracking-tight text-primary sm:text-3xl">{s.value}</div>
                  <p className="mx-auto mt-1 max-w-[18ch] text-xs leading-snug text-muted-foreground">{s.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal>
            <p className="mt-8 text-center text-[11px] text-muted-foreground/70">
              Representative figures for a typical academic year.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── How we care for you (services) ───────────────────────────────── */}
      <section className="mx-auto w-full max-w-6xl px-6 py-20">
        <Reveal className="max-w-2xl">
          <p className="mb-3 inline-flex rounded-full bg-accent px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-accent-foreground">
            How we care for you
          </p>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Everything you might need, gently under one roof.
          </h2>
          <p className="mt-2 text-muted-foreground">
            From the first hello at reception to the medicine in your hand, each part of the clinic
            works together so your visit feels calm and simple.
          </p>
        </Reveal>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s, i) => (
            <Reveal key={s.title} delay={(i % 3) * 90}>
              <article className="group h-full rounded-2xl border border-border bg-card p-6 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_1px_2px_rgba(14,26,47,0.05),0_20px_40px_-24px_rgba(14,26,47,0.45)]">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-brand-50 text-primary transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-110 dark:bg-accent">
                  <s.icon className="size-6" />
                </span>
                <h3 className="mt-4 font-semibold tracking-tight">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── What to expect when you visit ────────────────────────────────── */}
      <section className="border-y border-border bg-muted/40">
        <div className="mx-auto w-full max-w-6xl px-6 py-20">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-gold-soft px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-gold-soft-foreground">
              <Sparkles className="size-3.5" /> What to expect
            </p>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Nothing scary — just four calm steps.
            </h2>
            <p className="mt-2 text-muted-foreground">
              If it&rsquo;s your first time, here&rsquo;s exactly how a visit goes, from walking in to walking out.
            </p>
          </Reveal>

          <div className="relative mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {/* soft connecting line on large screens */}
            <div className="pointer-events-none absolute inset-x-8 top-11 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent lg:block" />
            {JOURNEY.map((j, i) => (
              <Reveal key={j.title} delay={i * 110}>
                <article className="group relative h-full rounded-2xl border border-border bg-card p-6 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1">
                  <span className="pointer-events-none absolute right-5 top-5 font-mono text-xs font-medium text-gold">
                    {j.step}
                  </span>
                  <span className="relative flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm transition-transform duration-300 group-hover:scale-105">
                    <j.icon className="size-5" />
                  </span>
                  <h3 className="mt-4 font-semibold tracking-tight">{j.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{j.body}</p>
                </article>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-3">
            {REASSURE.map((r) => (
              <div key={r.text} className="flex items-center gap-2 text-sm text-muted-foreground">
                <r.icon className="size-4 text-primary" /> {r.text}
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ── Student wellness note ─────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-6xl px-6 py-20">
        <Reveal>
          <div className="bg-brand-gradient relative overflow-hidden rounded-3xl px-8 py-14 text-white sm:px-14">
            <div className="anim-blob pointer-events-none absolute -left-20 -top-24 size-72 rounded-full bg-gold/20 blur-3xl" />
            <div className="anim-blob-2 pointer-events-none absolute -bottom-28 -right-16 size-80 rounded-full bg-white/10 blur-3xl" />
            <div className="relative grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-white/85 ring-1 ring-white/15">
                  <HeartHandshake className="size-3.5" /> Student wellness
                </p>
                <h2 className="max-w-xl text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
                  Your mind matters as much as your body.
                </h2>
                <p className="mt-4 max-w-lg leading-relaxed text-white/80">
                  Exams, homesickness, sleepless nights — it all adds up. Our counselors offer a
                  quiet, confidential space to talk things through, with no judgement and no cost.
                  Reaching out is a strong thing to do, and we&rsquo;re glad when you do.
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Button asChild size="lg" className="group bg-white text-brand-700 hover:bg-white/90">
                    <Link href="/student-login">
                      Open the student portal
                      <span className="ml-1 flex size-6 items-center justify-center rounded-full bg-brand-700/10 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5">
                        <ArrowRight className="size-3.5" />
                      </span>
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white">
                    <Link href="/login">Staff sign in</Link>
                  </Button>
                </div>
              </div>

              {/* contact card */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                {CONTACT.slice(0, 2).map((c) => (
                  <a
                    key={c.label}
                    href={c.href}
                    className="group flex items-center gap-3 rounded-2xl bg-white/10 p-4 ring-1 ring-white/15 transition-colors hover:bg-white/15"
                  >
                    <span className="flex size-10 items-center justify-center rounded-xl bg-white/15 text-white">
                      <c.icon className="size-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[11px] uppercase tracking-[0.12em] text-white/60">{c.label}</span>
                      <span className="block truncate font-medium">{c.value}</span>
                    </span>
                  </a>
                ))}
                <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-white/15 text-white">
                    <MapPin className="size-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[11px] uppercase tracking-[0.12em] text-white/60">Find us</span>
                    <span className="block font-medium">Dire Dawa University campus</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="mt-auto border-t border-border bg-card">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5">
              <LogoMark className="size-8" />
              <span className="font-semibold tracking-tight">DDU Clinic Center</span>
            </div>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
              On-campus healthcare for the Dire Dawa University community — treating illness,
              easing worry and caring for every student and staff member.
            </p>
          </div>
          <div>
            <h3 className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Care</h3>
            <ul className="mt-3 space-y-2 text-sm text-foreground">
              <li>General consultation</li>
              <li>Laboratory &amp; pharmacy</li>
              <li>Emergency &amp; ambulance</li>
              <li>Wellness &amp; counseling</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Contact</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <a href="tel:+251915151515" className="text-foreground transition-colors hover:text-primary">+251-915-15-15-15</a>
              </li>
              <li>
                <a href="mailto:DDUClinic@gmail.com" className="text-foreground transition-colors hover:text-primary">DDUClinic@gmail.com</a>
              </li>
              <li className="text-muted-foreground">Dire Dawa, Ethiopia</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Portal</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/student-login" className="text-foreground transition-colors hover:text-primary">Student portal</Link>
              </li>
              <li>
                <Link href="/login" className="text-foreground transition-colors hover:text-primary">Staff sign in</Link>
              </li>
              <li>
                <Link href="/verify" className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-primary">
                  <ShieldCheck className="size-3.5" /> Verify a document
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border">
          <div className="mx-auto w-full max-w-6xl px-6 py-5 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} Dire Dawa University Clinic Center · Caring for the campus community
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ── Hero visual: a softly floating cluster of reassuring status cards ─────── */
function HeroVisual() {
  return (
    <div className="relative [animation:ddu-rise_.9s_cubic-bezier(.32,.72,0,1)_.1s_both]">
      <div className="anim-float relative">
        <div className="pointer-events-none absolute -inset-4 rounded-[2rem] bg-white/5 ring-1 ring-white/10" />
        <div className="relative overflow-hidden rounded-2xl bg-card p-6 text-card-foreground shadow-[0_40px_80px_-30px_rgba(0,0,0,0.6)] sm:p-8">
          <div className="flex items-center gap-3">
            <LogoMark className="size-11" />
            <div>
              <div className="font-semibold tracking-tight">Student Clinic Center</div>
              <div className="text-xs text-muted-foreground">Dire Dawa University</div>
            </div>
            <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
              <span className="anim-pulse-dot size-1.5 rounded-full bg-success" /> Open now
            </span>
          </div>

          <div className="mt-6 rounded-xl bg-gold-soft p-4 text-gold-soft-foreground">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Clock className="size-4" /> Today&rsquo;s hours
            </div>
            <p className="mt-1 text-sm">Mon–Fri 8:00–17:00 · Emergency care 24/7</p>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            {[
              { icon: Stethoscope, k: "OPD", v: "Open" },
              { icon: FlaskConical, k: "Lab", v: "Open" },
              { icon: Pill, k: "Pharmacy", v: "Open" },
            ].map((t) => (
              <div key={t.k} className="rounded-xl border border-border bg-background p-3 text-center">
                <t.icon className="mx-auto size-5 text-primary" />
                <div className="mt-1.5 text-xs font-medium text-foreground">{t.k}</div>
                <div className="text-[11px] text-success">{t.v}</div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-3 rounded-xl border border-border bg-background p-4">
            <span className="flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <ClipboardList className="size-5" />
            </span>
            <div className="min-w-0">
              <div className="text-sm font-medium text-foreground">Your medical record</div>
              <div className="text-xs text-muted-foreground">Visits, results and prescriptions, safe in one place.</div>
            </div>
          </div>
        </div>
      </div>

      {/* small floating accent chip */}
      <div className="anim-float-slow absolute -bottom-5 -left-5 hidden items-center gap-2 rounded-2xl bg-card px-3.5 py-2.5 text-card-foreground shadow-[0_24px_50px_-24px_rgba(0,0,0,0.6)] sm:flex">
        <span className="flex size-8 items-center justify-center rounded-lg bg-gold-soft text-gold-soft-foreground">
          <HeartPulse className="size-4" />
        </span>
        <span className="text-xs font-medium leading-tight">
          Here for you
          <span className="block text-[11px] font-normal text-muted-foreground">every single day</span>
        </span>
      </div>
    </div>
  );
}

/* ── Motion ────────────────────────────────────────────────────────────────
   All keyframes/reveal transitions are scoped to `prefers-reduced-motion:
   no-preference`, so readers who prefer reduced motion get a still, calm page.
   Kept local to the landing route (globals.css is untouched). */
function LandingMotionStyles() {
  const css = `
@keyframes ddu-rise { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: none; } }
@keyframes ddu-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
@keyframes ddu-float-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(9px); } }
@keyframes ddu-blob { 0%, 100% { transform: translate(0, 0) scale(1); } 33% { transform: translate(24px, -18px) scale(1.06); } 66% { transform: translate(-16px, 14px) scale(0.95); } }
@keyframes ddu-pulse-dot { 0%, 100% { opacity: 1; box-shadow: 0 0 0 0 currentColor; } 50% { opacity: 0.55; box-shadow: 0 0 0 4px transparent; } }

/* Motion only for readers who welcome it. */
.reveal { will-change: opacity, transform; }
@media (prefers-reduced-motion: no-preference) {
  .reveal { opacity: 0; transform: translateY(18px); transition: opacity .7s cubic-bezier(.32,.72,0,1), transform .7s cubic-bezier(.32,.72,0,1); }
  .reveal.is-visible { opacity: 1; transform: none; }
  .anim-float { animation: ddu-float 7s ease-in-out infinite; }
  .anim-float-slow { animation: ddu-float-slow 8s ease-in-out infinite; }
  .anim-blob { animation: ddu-blob 18s ease-in-out infinite; }
  .anim-blob-2 { animation: ddu-blob 22s ease-in-out infinite reverse; }
  .anim-pulse-dot { animation: ddu-pulse-dot 2.4s ease-in-out infinite; }
}
@media (prefers-reduced-motion: reduce) {
  [class*="[animation:ddu-rise"] { animation: none !important; }
}
`;
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
