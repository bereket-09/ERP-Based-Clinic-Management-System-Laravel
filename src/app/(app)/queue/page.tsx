// Waiting-room queue board — a big-screen, high-contrast display for a lobby TV.
// NOTE: This route lives under (app), so it is behind auth (requireStaff in the
// (app) layout, re-asserted here). It is an async server component that reads the
// live queue; only the clock + auto-refresh are client components (./live).
import type { Prisma, VisitState } from "@prisma/client";
import { Clock, Stethoscope, Users, CheckCircle2, Pill } from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";
import { requireStaff } from "@/server/session";
import { db } from "@/server/db";
import { LogoMark } from "@/components/brand";
import { LiveClock, AutoRefresh } from "./live";

export const metadata = { title: "Patient Queue" };
export const dynamic = "force-dynamic";

type VisitRow = Prisma.VisitGetPayload<{ include: { patient: true; doctor: true } }>;

/** Short, privacy-preserving token: first name + last initial (falls back to MRN). */
function anonToken(name: string, mrn: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return mrn;
  const first = parts[0];
  const lastInitial = parts.length > 1 ? parts[parts.length - 1].charAt(0).toUpperCase() + "." : "";
  return lastInitial ? `${first} ${lastInitial}` : first;
}

/** Priority accent tuned for a dark board. */
const PRIORITY: Record<string, { label: string; dot: string; chip: string }> = {
  EMERGENCY: {
    label: "Emergency",
    dot: "bg-red-500",
    chip: "bg-red-500/20 text-red-200 ring-1 ring-inset ring-red-400/40",
  },
  URGENT: {
    label: "Urgent",
    dot: "bg-gold",
    chip: "bg-gold/20 text-gold ring-1 ring-inset ring-gold/40",
  },
  ROUTINE: {
    label: "Routine",
    dot: "bg-sky-400",
    chip: "bg-white/10 text-white/70 ring-1 ring-inset ring-white/15",
  },
};

function fetchByState(state: VisitState) {
  return db.visit.findMany({
    where: { state },
    include: { patient: true, doctor: true },
    orderBy: [{ priority: "desc" }, { openedAt: "asc" }],
    take: 12,
  });
}

function SummaryTile({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Users;
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div
      className={
        "flex items-center gap-4 rounded-2xl px-6 py-5 backdrop-blur " +
        (accent
          ? "bg-gold/15 ring-1 ring-inset ring-gold/40"
          : "bg-white/5 ring-1 ring-inset ring-white/10")
      }
    >
      <span
        className={
          "flex size-12 shrink-0 items-center justify-center rounded-xl " +
          (accent ? "bg-gold/25 text-gold" : "bg-white/10 text-white/80")
        }
      >
        <Icon className="size-6" />
      </span>
      <div className="leading-none">
        <div className={"text-4xl font-bold tabular-nums " + (accent ? "text-gold" : "text-white")}>
          {value}
        </div>
        <div className="mt-1.5 text-sm font-medium uppercase tracking-wide text-white/60">
          {label}
        </div>
      </div>
    </div>
  );
}

function PatientRow({ v, serving }: { v: VisitRow; serving?: boolean }) {
  const p = PRIORITY[v.priority] ?? PRIORITY.ROUTINE;
  return (
    <li
      className={
        "flex items-center justify-between gap-4 rounded-2xl px-5 py-4 transition-colors " +
        (serving
          ? "bg-gold/15 ring-1 ring-inset ring-gold/40"
          : "bg-white/5 ring-1 ring-inset ring-white/10")
      }
    >
      <div className="flex min-w-0 items-center gap-4">
        <span className={"size-3.5 shrink-0 rounded-full " + p.dot} aria-hidden />
        <div className="min-w-0">
          <div className="truncate text-2xl font-bold text-white">{anonToken(v.patient.name, v.patient.mrn)}</div>
          <div className="mt-1 text-sm font-medium text-white/50">
            {v.patient.mrn} · {v.visitNo}
          </div>
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <span className={"rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide " + p.chip}>
          {p.label}
        </span>
        <span className="text-sm font-medium text-white/50">
          {formatDistanceToNowStrict(v.openedAt)}
        </span>
      </div>
    </li>
  );
}

function QueueColumn({
  title,
  icon: Icon,
  visits,
  empty,
  accent,
}: {
  title: string;
  icon: typeof Users;
  visits: VisitRow[];
  empty: string;
  accent?: boolean;
}) {
  return (
    <section
      className={
        "flex min-h-0 flex-col rounded-2xl p-5 backdrop-blur " +
        (accent
          ? "bg-gold/10 ring-1 ring-inset ring-gold/30"
          : "bg-white/[0.04] ring-1 ring-inset ring-white/10")
      }
    >
      <header className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={
              "flex size-10 items-center justify-center rounded-xl " +
              (accent ? "bg-gold/25 text-gold" : "bg-white/10 text-white/80")
            }
          >
            <Icon className="size-5" />
          </span>
          <h2 className={"text-xl font-bold " + (accent ? "text-gold" : "text-white")}>{title}</h2>
        </div>
        <span
          className={
            "rounded-full px-3 py-1 text-lg font-bold tabular-nums " +
            (accent ? "bg-gold/25 text-gold" : "bg-white/10 text-white/80")
          }
        >
          {visits.length}
        </span>
      </header>
      {visits.length === 0 ? (
        <div className="flex flex-1 items-center justify-center py-10 text-center text-lg font-medium text-white/40">
          {empty}
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {visits.map((v) => (
            <PatientRow key={v.id} v={v} serving={accent} />
          ))}
        </ul>
      )}
    </section>
  );
}

export default async function QueueBoardPage() {
  await requireStaff();

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [waiting, inConsult, pharmacy, completedToday] = await Promise.all([
    fetchByState("WAITING_FOR_DOCTOR"),
    fetchByState("IN_CONSULTATION"),
    fetchByState("WAITING_FOR_PHARMACY"),
    db.visit.count({ where: { state: "COMPLETED", closedAt: { gte: startOfDay } } }),
  ]);

  return (
    <div className="bg-brand-gradient -m-4 flex min-h-[calc(100vh-4rem)] flex-col gap-6 rounded-3xl p-6 text-white sm:-m-6 sm:p-8">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <LogoMark className="size-14" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Patient Queue</h1>
            <p className="mt-1 flex items-center gap-2 text-base text-white/60">
              <Clock className="size-4" /> DDU Student Clinic Center
            </p>
          </div>
        </div>
        <LiveClock />
      </header>

      {/* Summary tiles */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryTile icon={Users} label="Waiting" value={waiting.length} />
        <SummaryTile icon={Stethoscope} label="Being seen" value={inConsult.length} accent />
        <SummaryTile icon={CheckCircle2} label="Completed today" value={completedToday} />
      </div>

      {/* Queue columns */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-5 lg:grid-cols-3">
        <QueueColumn
          title="Waiting for doctor"
          icon={Users}
          visits={waiting}
          empty="No one waiting"
        />
        <QueueColumn
          title="In consultation"
          icon={Stethoscope}
          visits={inConsult}
          empty="No active consultations"
          accent
        />
        <QueueColumn
          title="Ready for pharmacy"
          icon={Pill}
          visits={pharmacy}
          empty="Nothing to dispense"
        />
      </div>

      {/* Footer: live status + auto-refresh */}
      <footer className="flex items-center justify-between border-t border-white/10 pt-4">
        <AutoRefresh intervalMs={20_000} />
        <span className="text-sm text-white/40">Patient identities shown as short tokens for privacy</span>
      </footer>
    </div>
  );
}
