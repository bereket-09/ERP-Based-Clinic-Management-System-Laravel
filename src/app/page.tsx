import Link from "next/link";
import {
  Stethoscope,
  FlaskConical,
  Pill,
  BedDouble,
  HeartHandshake,
  Send,
  Clock,
  ShieldCheck,
  Sparkles,
  Phone,
  MapPin,
  Mail,
  ArrowRight,
  ArrowUpRight,
  Activity,
  CalendarCheck,
} from "lucide-react";
import { LogoMark } from "@/components/brand";
import { SiteNav } from "@/components/landing/site-nav";
import { Reveal } from "@/components/landing/reveal";

export const metadata = {
  title: "DDU Clinic — Dire Dawa University Student Clinic Center",
  description:
    "Warm, unhurried campus healthcare for Dire Dawa University students and staff — consultations, laboratory, pharmacy, wards and emergency care in one caring place.",
};

const ICON = { strokeWidth: 1.25 } as const;

const SERVICES = [
  { icon: Stethoscope, title: "General consultation", body: "Same-day care for fevers, aches, check-ups and everything in between — with a doctor who listens." },
  { icon: FlaskConical, title: "Laboratory", body: "On-site tests with results routed straight back to your doctor, so you're not left waiting or wondering." },
  { icon: Pill, title: "Pharmacy", body: "Prescriptions filled on campus from real batch-tracked stock — pick up your medicine and go rest." },
  { icon: BedDouble, title: "Wards & observation", body: "A quiet bed to stay the night when you need watching over, close to the people caring for you." },
  { icon: HeartHandshake, title: "Wellness & counseling", body: "A confidential space for your mental health, stress and the things that are harder to say out loud." },
  { icon: Send, title: "Referrals & follow-up", body: "When you need more, we refer you onward with a proper letter — and we follow up after." },
];

const STEPS = [
  { n: "01", title: "Come as you are", body: "Walk in or check in at reception. Bring your student ID — we'll pull up (or create) your one medical record." },
  { n: "02", title: "Triage & vitals", body: "A nurse takes your vitals and notes what's wrong, so the doctor already knows your story when you sit down." },
  { n: "03", title: "See the doctor", body: "Unhurried time with a clinician. Labs, medicines or a certificate are ordered right there if you need them." },
  { n: "04", title: "Rest & recover", body: "Collect your medicine, take your visit summary, and get back to being a student — we're here if you need us." },
];

const NUMBERS = [
  { value: "15,000+", label: "students & staff cared for" },
  { value: "10+", label: "years serving the campus" },
  { value: "40,000+", label: "consultations a year" },
  { value: "24/7", label: "emergency care, always open" },
];

const FAQ = [
  { q: "Who can be seen at the clinic?", a: "Every Dire Dawa University student, plus teaching and non-teaching staff. Bring your ID and we'll take care of the rest." },
  { q: "Do I need an appointment?", a: "No — you can walk in during clinic hours. Emergencies are seen any time, day or night. Appointments are available for follow-ups." },
  { q: "Is my information private?", a: "Yes. Your medical record is confidential and only accessible to the clinicians caring for you, protected by role-based access and audited access." },
  { q: "Can I get a sick-leave certificate?", a: "If a doctor decides you need rest, you'll receive an official, digitally verifiable sick-leave certificate you can present to your department." },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-background text-foreground antialiased">
      <SiteNav />

      {/* ══ HERO ══════════════════════════════════════════════════════════ */}
      <section className="relative isolate overflow-hidden bg-[#0a1a35] text-white">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="ddu-blob absolute -left-40 top-[-10%] size-[42rem] rounded-full bg-primary/25 blur-[120px]" />
          <div className="ddu-blob absolute right-[-15%] top-[20%] size-[36rem] rounded-full bg-[#1c3f7a]/40 blur-[120px]" style={{ animationDelay: "-6s" }} />
          <div className="absolute bottom-[-20%] left-1/3 size-[30rem] rounded-full bg-[#e0a112]/10 blur-[120px]" />
        </div>

        <div className="mx-auto grid w-full max-w-6xl items-center gap-14 px-6 pb-24 pt-36 lg:grid-cols-[1.05fr_0.95fr] lg:pb-32 lg:pt-44">
          <div>
            <Reveal>
              <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.22em] text-white/70 backdrop-blur">
                <span className="ddu-pulse size-1.5 rounded-full bg-[#e0a112]" />
                Dire Dawa University · Student Clinic Center
              </span>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="max-w-2xl text-balance text-5xl font-semibold leading-[1.02] tracking-tight sm:text-6xl lg:text-[4.5rem]">
                Feeling unwell?{" "}
                <span className="bg-gradient-to-r from-white via-white to-[#e9c877] bg-clip-text text-transparent">
                  You're in good hands.
                </span>
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/70">
                Your campus clinic is a short walk away and here whenever you need us — for a fever, a worry,
                a check-up or an emergency. Warm, unhurried care, so you can rest and get back to being a student.
              </p>
            </Reveal>
            <Reveal delay={240}>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Link
                  href="/student-login"
                  className="group inline-flex items-center gap-2 rounded-full bg-white py-3 pl-6 pr-2.5 text-base font-medium text-[#0a1a35] shadow-[0_10px_40px_-12px_rgba(255,255,255,0.5)] transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97]"
                >
                  Open student portal
                  <span className="flex size-8 items-center justify-center rounded-full bg-[#0a1a35]/10 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1 group-hover:-translate-y-px">
                    <ArrowRight className="size-4" {...ICON} />
                  </span>
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-base font-medium text-white backdrop-blur transition-colors duration-300 hover:bg-white/10"
                >
                  Staff sign in
                </Link>
              </div>
            </Reveal>
            <Reveal delay={320}>
              <dl className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-white/60">
                {[
                  [Clock, "Open to all students & staff"],
                  [ShieldCheck, "Emergency care 24/7"],
                  [Activity, "One caring, connected record"],
                ].map(([I, t], i) => {
                  const Ico = I as typeof Clock;
                  return (
                    <div key={i} className="flex items-center gap-2">
                      <Ico className="size-4 text-[#e0a112]" {...ICON} /> {t as string}
                    </div>
                  );
                })}
              </dl>
            </Reveal>
          </div>

          {/* Layered depth visual — double-bezel health card cluster */}
          <Reveal delay={200} className="relative">
            <div className="ddu-float relative mx-auto max-w-md">
              <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-2 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.7)] backdrop-blur-xl">
                <div className="rounded-[1.6rem] bg-white p-5 text-[#0e1a2f] shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <LogoMark className="size-11" />
                      <div className="leading-tight">
                        <div className="text-sm font-semibold">Student Clinic Center</div>
                        <div className="text-xs text-[#566379]">Dire Dawa University</div>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
                      <span className="ddu-pulse size-1.5 rounded-full bg-emerald-500" /> Open now
                    </span>
                  </div>

                  <div className="mt-4 rounded-xl bg-[#fbf1d6] px-4 py-3">
                    <div className="flex items-center gap-2 text-xs font-medium text-[#8a6708]">
                      <Clock className="size-3.5" {...ICON} /> Today's hours
                    </div>
                    <div className="mt-0.5 text-sm font-medium text-[#5c470a]">Mon–Fri 8:00–17:00 · Emergency care 24/7</div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2.5">
                    {[[Stethoscope, "OPD"], [FlaskConical, "Lab"], [Pill, "Pharmacy"]].map(([I, t], i) => {
                      const Ico = I as typeof Pill;
                      return (
                        <div key={i} className="rounded-xl border border-[#e6ecf6] bg-[#f7faff] px-2 py-3 text-center">
                          <Ico className="mx-auto size-5 text-[#1a56b0]" {...ICON} />
                          <div className="mt-1.5 text-xs font-medium">{t as string}</div>
                          <div className="text-[10px] text-emerald-600">Open</div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4 flex items-center gap-3 rounded-xl border border-[#e6ecf6] px-3.5 py-3">
                    <span className="flex size-9 items-center justify-center rounded-lg bg-[#eaf1fb] text-[#1a56b0]">
                      <CalendarCheck className="size-5" {...ICON} />
                    </span>
                    <div>
                      <div className="text-sm font-medium">Your medical record</div>
                      <div className="text-xs text-[#566379]">Visits, results & prescriptions, safe in one place.</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating accent chip */}
              <div className="ddu-float-slow absolute -bottom-5 -left-6 flex items-center gap-2.5 rounded-2xl border border-white/10 bg-white/90 px-4 py-2.5 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6)] backdrop-blur">
                <span className="flex size-8 items-center justify-center rounded-full bg-[#fbf1d6] text-[#c78d08]">
                  <HeartHandshake className="size-4" {...ICON} />
                </span>
                <div className="leading-tight">
                  <div className="text-xs font-semibold text-[#0e1a2f]">Here for you</div>
                  <div className="text-[11px] text-[#566379]">every single day</div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Curved base into the page */}
        <div className="h-16 rounded-t-[3rem] bg-background sm:h-20" />
      </section>

      {/* ══ NUMBERS ═══════════════════════════════════════════════════════ */}
      <section id="numbers" className="mx-auto w-full max-w-6xl px-6 py-16 sm:py-20">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
          {NUMBERS.map((n, i) => (
            <Reveal key={n.label} delay={i * 80} className="text-center sm:text-left">
              <div className="text-4xl font-semibold tracking-tight text-primary tabular-nums sm:text-5xl">{n.value}</div>
              <p className="mx-auto mt-2 max-w-[18ch] text-sm leading-snug text-muted-foreground sm:mx-0">{n.label}</p>
            </Reveal>
          ))}
        </div>
        <p className="mt-8 text-center text-xs text-muted-foreground/70 sm:text-left">Representative figures for a typical academic year.</p>
      </section>

      {/* ══ SERVICES (asymmetric bento, double-bezel) ═════════════════════ */}
      <section id="services" className="mx-auto w-full max-w-6xl px-6 py-20 sm:py-28">
        <div className="max-w-2xl">
          <Reveal>
            <span className="mb-4 inline-flex rounded-full bg-accent px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-accent-foreground">
              How we care for you
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="text-3xl font-semibold leading-tight tracking-tight text-balance sm:text-4xl">
              Everything you need to feel better, under one roof.
            </h2>
          </Reveal>
          <Reveal delay={140}>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              From the first fever to a full recovery — the whole journey lives in one calm, connected place.
            </p>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {SERVICES.map((s, i) => (
            <Reveal key={s.title} delay={(i % 3) * 90} className={i === 0 ? "md:col-span-2" : ""}>
              <article className="group h-full rounded-[2rem] border border-border/70 bg-foreground/[0.015] p-1.5 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1">
                <div className="flex h-full flex-col rounded-[1.6rem] bg-card p-6 shadow-[0_1px_2px_rgba(14,26,47,0.04),0_20px_50px_-32px_rgba(14,26,47,0.5)]">
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-[#eaf1fb] text-[#1a56b0] transition-colors duration-500 group-hover:bg-[#1a56b0] group-hover:text-white dark:bg-primary/15">
                    <s.icon className="size-6" {...ICON} />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ══ YOUR VISIT (editorial split, numbered steps) ══════════════════ */}
      <section id="visit" className="border-y border-border bg-card/40">
        <div className="mx-auto grid w-full max-w-6xl gap-14 px-6 py-20 sm:py-28 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Reveal>
              <span className="mb-4 inline-flex rounded-full bg-accent px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-accent-foreground">
                What to expect
              </span>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="text-3xl font-semibold leading-tight tracking-tight text-balance sm:text-4xl">
                A calm, simple visit — from the door to your recovery.
              </h2>
            </Reveal>
            <Reveal delay={140}>
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                No confusing queues or paperwork mountains. Just a few gentle steps, and people looking out for you at each one.
              </p>
            </Reveal>
            <Reveal delay={200}>
              <div className="mt-8 flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
                <span className="flex size-10 items-center justify-center rounded-xl bg-[#fbf1d6] text-[#c78d08]">
                  <ShieldCheck className="size-5" {...ICON} />
                </span>
                <p className="text-sm text-muted-foreground">
                  Kind, judgement-free care. Your visit and records are private — always.
                </p>
              </div>
            </Reveal>
          </div>

          <div className="space-y-4">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 90}>
                <div className="group flex gap-5 rounded-[1.75rem] border border-border/70 bg-card p-6 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5">
                  <div className="text-2xl font-semibold tabular-nums text-primary/30 transition-colors duration-500 group-hover:text-primary">
                    {s.n}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{s.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ WELLNESS (navy, glow) ═════════════════════════════════════════ */}
      <section id="wellness" className="relative isolate overflow-hidden bg-[#0a1a35] py-20 text-white sm:py-28">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="ddu-blob absolute left-1/4 top-0 size-[34rem] rounded-full bg-primary/20 blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 size-[26rem] rounded-full bg-[#e0a112]/10 blur-[120px]" />
        </div>
        <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-6 lg:grid-cols-[1fr_0.8fr]">
          <div>
            <Reveal>
              <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-white/70">
                <Sparkles className="size-3.5 text-[#e0a112]" {...ICON} /> Student wellness
              </span>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="max-w-xl text-3xl font-semibold leading-tight tracking-tight text-balance sm:text-4xl">
                Your mind matters just as much as your body.
              </h2>
            </Reveal>
            <Reveal delay={140}>
              <p className="mt-4 max-w-lg text-lg leading-relaxed text-white/70">
                Exams, homesickness, stress, or something heavier — you don't have to carry it alone. Our counseling
                and wellness team offers a confidential, caring space to talk it through.
              </p>
            </Reveal>
            <Reveal delay={200}>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/student-login" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-[#0a1a35] transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97]">
                  Reach the wellness team <ArrowUpRight className="size-4" {...ICON} />
                </Link>
              </div>
            </Reveal>
          </div>
          <Reveal delay={160}>
            <div className="grid gap-3">
              {[
                ["Confidential counseling", "One-to-one sessions, kept private."],
                ["Health education", "Practical guidance for staying well on campus."],
                ["Chronic-care follow-up", "Ongoing support if you live with a condition."],
              ].map(([t, b]) => (
                <div key={t} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur">
                  <div className="text-sm font-semibold">{t}</div>
                  <div className="mt-0.5 text-sm text-white/60">{b}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══ QUOTE ═════════════════════════════════════════════════════════ */}
      <section className="mx-auto w-full max-w-4xl px-6 py-20 text-center sm:py-28">
        <Reveal>
          <p className="text-2xl font-medium leading-snug tracking-tight text-balance sm:text-3xl">
            <span className="text-primary">“</span>I came in scared and left feeling looked after. They took the time
            to explain everything, and I actually felt like someone cared.<span className="text-primary">”</span>
          </p>
        </Reveal>
        <Reveal delay={120}>
          <div className="mt-6 text-sm text-muted-foreground">A DDU student · representative of the care we aim for</div>
        </Reveal>
      </section>

      {/* ══ FAQ ═══════════════════════════════════════════════════════════ */}
      <section className="mx-auto w-full max-w-3xl px-6 pb-20 sm:pb-28">
        <Reveal>
          <h2 className="text-center text-3xl font-semibold tracking-tight sm:text-4xl">Good to know</h2>
        </Reveal>
        <div className="mt-10 space-y-3">
          {FAQ.map((f, i) => (
            <Reveal key={f.q} delay={i * 70}>
              <details className="group rounded-2xl border border-border bg-card p-5 [&_summary]:cursor-pointer">
                <summary className="flex list-none items-center justify-between gap-4 text-base font-medium">
                  {f.q}
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-open:rotate-45">
                    <svg viewBox="0 0 24 24" fill="none" className="size-4" stroke="currentColor" strokeWidth={1.5}>
                      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                    </svg>
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ══ CTA ═══════════════════════════════════════════════════════════ */}
      <section className="mx-auto w-full max-w-6xl px-6 pb-24">
        <Reveal>
          <div className="relative isolate overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#0a1a35] px-8 py-16 text-center text-white sm:px-16 sm:py-20">
            <div className="pointer-events-none absolute inset-0 -z-10">
              <div className="ddu-blob absolute -left-20 top-0 size-96 rounded-full bg-primary/25 blur-[100px]" />
              <div className="absolute -right-10 bottom-0 size-80 rounded-full bg-[#e0a112]/15 blur-[100px]" />
            </div>
            <h2 className="mx-auto max-w-2xl text-3xl font-semibold leading-tight tracking-tight text-balance sm:text-4xl">
              Whenever you're not feeling your best, we're right here.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-white/70">
              Sign in to your student portal to see your visits, results and documents — or reach the clinic directly.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/student-login" className="group inline-flex items-center gap-2 rounded-full bg-white py-3 pl-6 pr-2.5 text-base font-medium text-[#0a1a35] transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97]">
                Open student portal
                <span className="flex size-8 items-center justify-center rounded-full bg-[#0a1a35]/10 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1">
                  <ArrowRight className="size-4" {...ICON} />
                </span>
              </Link>
              <Link href="/login" className="inline-flex items-center rounded-full border border-white/20 bg-white/5 px-6 py-3 text-base font-medium text-white transition-colors duration-300 hover:bg-white/10">
                Staff sign in
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ══ FOOTER ════════════════════════════════════════════════════════ */}
      <footer className="border-t border-border bg-card/40">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5">
              <LogoMark className="size-9" />
              <div className="leading-tight">
                <div className="font-semibold tracking-tight">DDU Clinic Center</div>
                <div className="text-xs text-muted-foreground">Dire Dawa University · Student Clinic Center</div>
              </div>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Caring for the health and wellbeing of the Dire Dawa University community — every student, every day.
            </p>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Visit us</div>
            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><MapPin className="size-4 shrink-0 text-primary" {...ICON} /> Main Campus, Dire Dawa</li>
              <li className="flex items-center gap-2"><Clock className="size-4 shrink-0 text-primary" {...ICON} /> Mon–Fri 8:00–17:00 · 24/7 ER</li>
              <li className="flex items-center gap-2"><Phone className="size-4 shrink-0 text-primary" {...ICON} /> Campus clinic line</li>
              <li className="flex items-center gap-2"><Mail className="size-4 shrink-0 text-primary" {...ICON} /> clinic@ddu.edu.et</li>
            </ul>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Quick links</div>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link href="/student-login" className="text-muted-foreground transition-colors hover:text-foreground">Student portal</Link></li>
              <li><Link href="/login" className="text-muted-foreground transition-colors hover:text-foreground">Staff sign in</Link></li>
              <li><Link href="/verify" className="text-muted-foreground transition-colors hover:text-foreground">Verify a document</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-6 py-6 text-xs text-muted-foreground sm:flex-row">
            <span>© {new Date().getFullYear()} Dire Dawa University Student Clinic Center</span>
            <span>Caring for the campus community, every day.</span>
          </div>
        </div>
      </footer>

      {/* ══ MOTION (scoped; disabled under prefers-reduced-motion) ════════ */}
      <style>{`
        .reveal { opacity: 1; }
        @media (prefers-reduced-motion: no-preference) {
          /* Only armed (below-the-fold at load) elements start hidden and animate
             in; above-the-fold content is never armed, so it paints immediately. */
          .reveal-armed { opacity: 0; transform: translateY(28px); filter: blur(6px);
            transition: opacity .9s cubic-bezier(.32,.72,0,1), transform .9s cubic-bezier(.32,.72,0,1), filter .9s cubic-bezier(.32,.72,0,1); }
          .reveal-armed.is-visible { opacity: 1; transform: none; filter: none; }
          @keyframes ddu-float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-14px) } }
          .ddu-float { animation: ddu-float 7s ease-in-out infinite; }
          .ddu-float-slow { animation: ddu-float 9s ease-in-out infinite; }
          @keyframes ddu-blob { 0%,100% { transform: translate(0,0) scale(1) } 50% { transform: translate(24px,-18px) scale(1.08) } }
          .ddu-blob { animation: ddu-blob 16s ease-in-out infinite; }
          @keyframes ddu-pulse { 0%,100% { opacity: 1; transform: scale(1) } 50% { opacity: .5; transform: scale(.8) } }
          .ddu-pulse { animation: ddu-pulse 2.2s ease-in-out infinite; }
        }
      `}</style>
    </div>
  );
}
