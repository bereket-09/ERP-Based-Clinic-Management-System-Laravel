import Link from "next/link";
import {
  Activity,
  Ambulance,
  ArrowRight,
  Bandage,
  BedDouble,
  CalendarCheck,
  CheckCircle2,
  ClipboardList,
  Clock,
  FlaskConical,
  FolderHeart,
  GraduationCap,
  HeartHandshake,
  HeartPulse,
  Mail,
  MapPin,
  Phone,
  Pill,
  Send,
  ShieldPlus,
  Sparkles,
  Stethoscope,
  Syringe,
  UserPlus,
  Users,
} from "lucide-react";
import { LogoMark } from "@/components/brand";
import { Button } from "@/components/ui/button";

/* ── Content ──────────────────────────────────────────────────────────────
   Real clinic information adapted from the DDU Clinic Center. Statistics are
   representative figures for a typical academic year, clearly framed as such. */

const SERVICES = [
  {
    icon: Stethoscope,
    title: "General consultation",
    body: "Walk-in and scheduled outpatient visits for students and staff — history, examination, diagnosis and treatment, all in one record.",
  },
  {
    icon: FlaskConical,
    title: "Laboratory & diagnostics",
    body: "On-site blood work, microbiology and routine screening, with results returned quickly to your care team.",
  },
  {
    icon: Pill,
    title: "Pharmacy & dispensing",
    body: "Prescriptions filled at the campus pharmacy with careful counselling on how to take your medicines safely.",
  },
  {
    icon: Syringe,
    title: "Immunization",
    body: "Seasonal vaccination and campus immunization campaigns that keep the whole university community protected.",
  },
  {
    icon: Bandage,
    title: "Minor procedures & wound care",
    body: "Dressings, suturing, injections and other minor treatments handled on campus, without a trip across town.",
  },
  {
    icon: BedDouble,
    title: "Wards & observation",
    body: "Short-stay beds for students who need rest, fluids or observation before they are well enough to return.",
  },
  {
    icon: Ambulance,
    title: "Emergency & ambulance",
    body: "Round-the-clock emergency response with ambulance dispatch, so urgent cases are reached without delay.",
  },
  {
    icon: Send,
    title: "Referrals & follow-up",
    body: "Seamless referral to partner hospitals for specialist care, with the clinic coordinating your follow-up.",
  },
];

const STATS = [
  { icon: Users, value: "15,000+", label: "students & staff served" },
  { icon: GraduationCap, value: "10+ years", label: "caring for the campus" },
  { icon: Activity, value: "40,000+", label: "consultations a year" },
  { icon: HeartPulse, value: "30+", label: "clinicians & support staff" },
];

const WELLNESS = [
  {
    icon: HeartHandshake,
    title: "Counseling & mental wellness",
    body: "Confidential support for stress, anxiety and the pressures of student life — someone to talk to, whenever you need it.",
  },
  {
    icon: ShieldPlus,
    title: "Health education",
    body: "Awareness sessions and outreach on nutrition, hygiene and healthy living across the residence halls and faculties.",
  },
  {
    icon: CalendarCheck,
    title: "Chronic care follow-up",
    body: "Ongoing monitoring for students managing long-term conditions, so studies never come at the cost of health.",
  },
];

const JOURNEY = [
  { icon: UserPlus, step: "01", title: "Register", body: "Reception opens your record and directs you to the right department." },
  { icon: Stethoscope, step: "02", title: "Consult", body: "A clinician examines you, records findings and plans your care." },
  { icon: FlaskConical, step: "03", title: "Lab & pharmacy", body: "Tests are processed and medicines dispensed, linked to your visit." },
  { icon: FolderHeart, step: "04", title: "Records", body: "Everything is saved to your history for safe, continuous care." },
];

const CONTACT = [
  { icon: Phone, label: "Call the clinic", value: "+251-915-15-15-15", href: "tel:+251915151515" },
  { icon: Mail, label: "Email us", value: "DDUClinic@gmail.com", href: "mailto:DDUClinic@gmail.com?subject=Clinic%20Enquiry" },
  { icon: MapPin, label: "Find us", value: "Dire Dawa University, Dire Dawa, Ethiopia", href: undefined },
  { icon: Clock, label: "Opening hours", value: "Mon–Fri 8:00–17:00 · Emergency 24/7", href: undefined },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col">
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
              Caring for the campus community, every day.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/75">
              Accessible, on-campus healthcare for students, teaching staff and employees — from
              everyday consultations to laboratory, pharmacy and emergency care. So the university
              can stay focused on learning, teaching and research.
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
            <dl className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-white/70">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-gold" /> Open to all students & staff
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-gold" /> Emergency care 24/7
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-gold" /> One connected medical record
              </div>
            </dl>
          </div>

          <HeroCard />
        </div>
      </section>

      {/* ── Care in numbers ──────────────────────────────────────────────── */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto w-full max-w-6xl px-6 py-10">
          <p className="mb-6 text-center text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Our care in numbers
          </p>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <span className="mx-auto flex size-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                  <s.icon className="size-5" />
                </span>
                <div className="mt-3 text-2xl font-semibold tracking-tight text-primary sm:text-3xl">{s.value}</div>
                <p className="mx-auto mt-1 max-w-[18ch] text-xs leading-snug text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-[11px] text-muted-foreground/70">
            Representative figures for a typical academic year.
          </p>
        </div>
      </section>

      {/* ── Services ─────────────────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-6xl px-6 py-20">
        <div className="max-w-2xl">
          <p className="mb-3 inline-flex rounded-full bg-accent px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-accent-foreground">
            What we offer
          </p>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Comprehensive care under one roof.
          </h2>
          <p className="mt-2 text-muted-foreground">
            Every department works together so your visit flows smoothly — from the front desk to
            consultation, lab, pharmacy and beyond.
          </p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((s) => (
            <article
              key={s.title}
              className="group rounded-2xl border border-border bg-card p-6 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:shadow-[0_1px_2px_rgba(14,26,47,0.05),0_16px_36px_-20px_rgba(14,26,47,0.4)]"
            >
              <span className="flex size-11 items-center justify-center rounded-xl bg-brand-50 text-primary transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105">
                <s.icon className="size-5" />
              </span>
              <h3 className="mt-4 font-semibold tracking-tight">{s.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ── Student health & wellness ────────────────────────────────────── */}
      <section className="border-y border-border bg-muted/40">
        <div className="mx-auto grid w-full max-w-6xl gap-12 px-6 py-20 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-gold-soft px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-gold-soft-foreground">
              <Sparkles className="size-3.5" /> Student health & wellness
            </p>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Health that supports every student’s journey.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Good health is the foundation of a good education. Beyond treating illness, the clinic
              helps students stay well — with counseling, preventive care and health education that
              meet the realities of campus life.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild variant="primary">
                <Link href="/student-login">
                  Open the student portal
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-1">
            {WELLNESS.map((w) => (
              <article
                key={w.title}
                className="flex gap-4 rounded-2xl border border-border bg-card p-5"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                  <w.icon className="size-5" />
                </span>
                <div>
                  <h3 className="font-semibold tracking-tight">{w.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{w.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── How care flows ───────────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-6xl px-6 py-20">
        <div className="max-w-2xl">
          <p className="mb-3 inline-flex rounded-full bg-accent px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-accent-foreground">
            How care flows
          </p>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            From first visit to follow-up.
          </h2>
          <p className="mt-2 text-muted-foreground">
            A simple, guided path keeps your care connected at every step.
          </p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {JOURNEY.map((j) => (
            <article key={j.title} className="relative rounded-2xl border border-border bg-card p-6">
              <span className="pointer-events-none absolute right-5 top-5 font-mono text-xs font-medium text-gold">
                {j.step}
              </span>
              <span className="flex size-11 items-center justify-center rounded-xl bg-brand-50 text-primary">
                <j.icon className="size-5" />
              </span>
              <h3 className="mt-4 font-semibold tracking-tight">{j.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{j.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ── Visit us / contact ───────────────────────────────────────────── */}
      <section className="border-y border-border bg-muted/40">
        <div className="mx-auto w-full max-w-6xl px-6 py-20">
          <div className="max-w-2xl">
            <p className="mb-3 inline-flex rounded-full bg-accent px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-accent-foreground">
              Visit us
            </p>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              We’re here on campus, whenever you need us.
            </h2>
            <p className="mt-2 text-muted-foreground">
              Reach the clinic for appointments, records or general enquiries — or simply drop by.
            </p>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {CONTACT.map((c) => {
              const inner = (
                <>
                  <span className="flex size-11 items-center justify-center rounded-xl bg-brand-50 text-primary">
                    <c.icon className="size-5" />
                  </span>
                  <h3 className="mt-4 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                    {c.label}
                  </h3>
                  <p className="mt-1 font-medium tracking-tight text-foreground">{c.value}</p>
                </>
              );
              return c.href ? (
                <a
                  key={c.label}
                  href={c.href}
                  className="group rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/40"
                >
                  {inner}
                </a>
              ) : (
                <div key={c.label} className="rounded-2xl border border-border bg-card p-6">
                  {inner}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-6xl px-6 py-20">
        <div className="bg-brand-gradient relative overflow-hidden rounded-3xl px-8 py-14 text-center text-white sm:px-16">
          <div className="pointer-events-none absolute -left-20 -top-20 size-72 rounded-full bg-gold/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -right-16 size-80 rounded-full bg-white/10 blur-3xl" />
          <div className="relative">
            <h2 className="mx-auto max-w-xl text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
              Your campus clinic, a click away.
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-white/75">
              Students book visits and view records through the portal. Staff sign in to their
              dedicated workspace to deliver care.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" className="group bg-white text-brand-700 hover:bg-white/90">
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
          </div>
        </div>
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
              protecting health and caring for every student and staff member.
            </p>
          </div>
          <div>
            <h3 className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Care</h3>
            <ul className="mt-3 space-y-2 text-sm text-foreground">
              <li>General consultation</li>
              <li>Laboratory & pharmacy</li>
              <li>Emergency & ambulance</li>
              <li>Student wellness</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Contact</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <a href="tel:+251915151515" className="text-foreground hover:text-primary">+251-915-15-15-15</a>
              </li>
              <li>
                <a href="mailto:DDUClinic@gmail.com" className="text-foreground hover:text-primary">DDUClinic@gmail.com</a>
              </li>
              <li className="text-muted-foreground">Dire Dawa, Ethiopia</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Portal</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/student-login" className="text-foreground hover:text-primary">Student portal</Link>
              </li>
              <li>
                <Link href="/login" className="text-foreground hover:text-primary">Staff sign in</Link>
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

/* ── Hero card: a warm institutional identity card, built from tokens ─────── */
function HeroCard() {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute -inset-4 rounded-[2rem] bg-white/5 ring-1 ring-white/10" />
      <div className="relative overflow-hidden rounded-2xl bg-card p-6 text-card-foreground shadow-[0_40px_80px_-30px_rgba(0,0,0,0.6)] sm:p-8">
        <div className="flex items-center gap-3">
          <LogoMark className="size-11" />
          <div>
            <div className="font-semibold tracking-tight">Student Clinic Center</div>
            <div className="text-xs text-muted-foreground">Dire Dawa University</div>
          </div>
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
            <span className="size-1.5 rounded-full bg-success" /> Open now
          </span>
        </div>

        <div className="mt-6 rounded-xl bg-gold-soft p-4 text-gold-soft-foreground">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Clock className="size-4" /> Today’s hours
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
            <div className="text-xs text-muted-foreground">Visits, results and prescriptions in one secure place.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
