import Link from "next/link";
import {
  startOfDay,
  endOfDay,
  subDays,
  isSameDay,
  format,
} from "date-fns";
import {
  Stethoscope,
  FlaskConical,
  Pill,
  Users,
  BedDouble,
  AlertTriangle,
  ArrowRight,
  Activity,
  CheckCircle2,
  Layers,
  TrendingUp,
  Wallet,
  ClipboardList,
  CalendarDays,
  UserPlus,
  PackageX,
  Sparkles,
} from "lucide-react";
import { requireStaff } from "@/server/session";
import { db } from "@/server/db";
import { roleLabel } from "@/lib/rbac";
import { initials } from "@/lib/utils";
import { Panel } from "@/components/dashboard/panel";
import { MetricTile } from "@/components/dashboard/metric-tile";
import { Sparkline } from "@/components/dashboard/sparkline";
import { FlowFunnel } from "@/components/dashboard/flow-funnel";
import { ActivityFeed, type FeedItem } from "@/components/dashboard/activity-feed";
import { RadialGauge } from "@/components/dashboard/radial-gauge";

export const metadata = { title: "Dashboard" };

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

const birr = (n: number) =>
  `Br ${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

export default async function DashboardPage() {
  const actor = await requireStaff();
  const role = actor.role;

  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const weekStart = subDays(todayStart, 6);

  const openLabStates = ["ORDERED", "COLLECTING", "IN_PROGRESS"] as const;
  const openDrugStates = ["ORDERED", "PARTIALLY_DISPENSED"] as const;

  const [
    byState,
    completedToday,
    openLabOrders,
    openDrugOrders,
    admitted,
    pendingLeaves,
    registrationsToday,
    lowStockMeds,
    activeVisits,
    last7,
    doctorQueue,
    labWorklist,
    dispenseQueue,
    todaysAppointments,
    leaveQueue,
    stockRequestsQueue,
    revenueAgg,
    totalBeds,
    occupiedBeds,
    activeStaff,
  ] = await Promise.all([
    db.visit.groupBy({ by: ["state"], _count: { _all: true } }),
    db.visit.count({ where: { state: "COMPLETED", closedAt: { gte: todayStart } } }),
    db.labOrder.count({ where: { state: { in: [...openLabStates] } } }),
    db.drugOrder.count({ where: { state: { in: [...openDrugStates] } } }),
    db.admission.count({ where: { state: { in: ["ADMITTED", "ON_WARD"] } } }),
    db.leaveRequest.count({ where: { state: "SUBMITTED" } }),
    db.visit.count({ where: { openedAt: { gte: todayStart } } }),
    db.medication.findMany({ include: { batches: true } }),
    db.visit.findMany({
      where: { state: { notIn: ["COMPLETED", "CANCELLED"] } },
      include: { patient: true, doctor: true },
      orderBy: [{ priority: "desc" }, { openedAt: "desc" }],
      take: 6,
    }),
    db.visit.findMany({
      where: { openedAt: { gte: weekStart } },
      select: { openedAt: true },
    }),
    db.visit.findMany({
      where: {
        state: { in: ["WAITING_FOR_DOCTOR", "IN_CONSULTATION", "LAB_RESULTS_READY"] },
        ...(role === "DOCTOR" ? { OR: [{ doctorId: actor.id }, { doctorId: null }] } : {}),
      },
      include: { patient: true },
      orderBy: [{ priority: "desc" }, { openedAt: "asc" }],
      take: 6,
    }),
    db.labOrder.findMany({
      where: { state: { in: [...openLabStates] } },
      include: { visit: { include: { patient: true } }, items: true },
      orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
      take: 6,
    }),
    db.drugOrder.findMany({
      where: { state: { in: [...openDrugStates] } },
      include: { visit: { include: { patient: true } }, items: true },
      orderBy: { createdAt: "asc" },
      take: 6,
    }),
    db.appointment.findMany({
      where: { scheduledFor: { gte: todayStart, lte: todayEnd } },
      include: { patient: true, provider: true },
      orderBy: { scheduledFor: "asc" },
      take: 6,
    }),
    db.leaveRequest.findMany({
      where: { state: "SUBMITTED" },
      include: { employee: true },
      orderBy: { createdAt: "asc" },
      take: 6,
    }),
    db.stockRequest.findMany({
      where: { state: "SUBMITTED" },
      include: { requester: true },
      orderBy: { createdAt: "asc" },
      take: 6,
    }),
    db.payment.aggregate({ _sum: { amount: true }, where: { createdAt: { gte: todayStart } } }),
    db.bed.count(),
    db.bed.count({ where: { status: "OCCUPIED" } }),
    db.user.count({ where: { isActive: true, employmentStatus: "ACTIVE" } }),
  ]);

  const count = (s: string) => byState.find((r) => r.state === s)?._count._all ?? 0;

  const lowStockList = lowStockMeds
    .map((m) => ({ ...m, onHand: m.batches.reduce((sum, b) => sum + b.quantity, 0) }))
    .filter((m) => m.onHand <= m.reorderLevel)
    .sort((a, b) => a.onHand - b.onHand);
  const lowStockCount = lowStockList.length;

  const activeTotal = byState
    .filter((r) => r.state !== "COMPLETED" && r.state !== "CANCELLED")
    .reduce((sum, r) => sum + r._count._all, 0);

  const revenueToday = revenueAgg._sum.amount ?? 0;

  // ── Visits over the last 7 days (bucketed for the sparkline) ───────────────
  const spark = Array.from({ length: 7 }, (_, i) => {
    const day = subDays(todayStart, 6 - i);
    return {
      label: format(day, "EEE"),
      value: last7.filter((v) => isSameDay(v.openedAt, day)).length,
    };
  });
  const weekTotal = spark.reduce((s, d) => s + d.value, 0);

  // ── Patient-flow funnel ────────────────────────────────────────────────────
  const flow = [
    {
      label: "Registered & triage",
      value: count("REGISTERED") + count("TRIAGE"),
      bar: "bg-brand-300",
      href: "/reception",
    },
    {
      label: "With the doctor",
      value: count("WAITING_FOR_DOCTOR") + count("IN_CONSULTATION"),
      bar: "bg-brand-400",
      href: "/doctor",
    },
    {
      label: "Lab & pharmacy",
      value:
        count("WAITING_FOR_LAB") + count("LAB_RESULTS_READY") + count("WAITING_FOR_PHARMACY"),
      bar: "bg-brand-500",
      href: "/lab",
    },
    {
      label: "Completed today",
      value: completedToday,
      bar: "bg-gold",
    },
  ];

  const firstName =
    actor.name.replace(/^(Dr|Sr|Mr|Mrs|Ms|Prof)\.?\s+/i, "").split(" ")[0] || actor.name;

  // ── Feed mappers ───────────────────────────────────────────────────────────
  const priorityAccent = (p: string) =>
    p === "EMERGENCY" ? "bg-destructive" : p === "URGENT" ? "bg-warning" : "bg-primary";

  const visitFeed = (
    list: { id: string; visitNo: string; state: string; priority: string; patient: { name: string; mrn: string }; doctor?: { name: string } | null }[],
  ): FeedItem[] =>
    list.map((v) => ({
      id: v.id,
      avatar: initials(v.patient.name),
      title: v.patient.name,
      subtitle: `${v.patient.mrn}${v.doctor ? ` · ${v.doctor.name}` : ""}`,
      state: v.state,
      meta: v.visitNo,
      href: `/visits/${v.id}`,
      accent: priorityAccent(v.priority),
    }));

  // ── Role-tailored panels ───────────────────────────────────────────────────
  let primaryPanel: React.ReactNode;
  let sidePanels: React.ReactNode;

  if (role === "DOCTOR") {
    const labReady = doctorQueue.filter((v) => v.state === "LAB_RESULTS_READY");
    primaryPanel = (
      <Panel
        title="My consultation queue"
        description="Ordered by priority, then arrival"
        icon={Stethoscope}
        action={{ label: "Open queue", href: "/doctor" }}
        className="lg:col-span-2"
      >
        <ActivityFeed
          items={visitFeed(doctorQueue)}
          empty={{ title: "Your queue is clear", description: "Patients waiting for you will appear here.", icon: CheckCircle2 }}
        />
      </Panel>
    );
    sidePanels = (
      <div className="flex flex-col gap-4">
        <Panel title="Lab results ready" icon={FlaskConical} accent={labReady.length > 0}>
          {labReady.length === 0 ? (
            <p className="py-2 text-sm text-muted-foreground">No results waiting for review.</p>
          ) : (
            <ActivityFeed items={visitFeed(labReady)} />
          )}
        </Panel>
        <MyDay
          lines={[
            { label: "In your queue", value: doctorQueue.length },
            { label: "Results to review", value: labReady.length },
            { label: "Admitted patients", value: admitted },
          ]}
          actions={[
            { href: "/doctor", label: "Consultation queue" },
            { href: "/patients", label: "Find a patient" },
          ]}
        />
      </div>
    );
  } else if (role === "PHARMACIST") {
    primaryPanel = (
      <Panel
        title="Dispensing queue"
        description="Prescriptions awaiting the pharmacy"
        icon={Pill}
        action={{ label: "Open pharmacy", href: "/pharmacy" }}
        className="lg:col-span-2"
      >
        <ActivityFeed
          items={dispenseQueue.map((o) => ({
            id: o.id,
            avatar: initials(o.visit.patient.name),
            title: o.visit.patient.name,
            subtitle: `${o.items.length} item(s) · ${o.orderNo}`,
            state: o.state,
            href: `/pharmacy`,
          }))}
          empty={{ title: "Nothing to dispense", description: "New prescriptions arrive here from doctors.", icon: CheckCircle2 }}
        />
      </Panel>
    );
    sidePanels = (
      <div className="flex flex-col gap-4">
        <Panel title="Low & out of stock" icon={PackageX} accent={lowStockCount > 0}>
          <LowStockList items={lowStockList.slice(0, 6)} total={lowStockCount} />
        </Panel>
        <MyDay
          lines={[
            { label: "To dispense", value: openDrugOrders },
            { label: "Low stock items", value: lowStockCount },
          ]}
          actions={[
            { href: "/pharmacy", label: "Dispensing queue" },
            { href: "/pharmacy", label: "Inventory & batches" },
          ]}
        />
      </div>
    );
  } else if (role === "LAB_TECH") {
    primaryPanel = (
      <Panel
        title="Laboratory worklist"
        description="Specimens to collect, run and result"
        icon={FlaskConical}
        action={{ label: "Open lab", href: "/lab" }}
        className="lg:col-span-2"
      >
        <ActivityFeed
          items={labWorklist.map((o) => ({
            id: o.id,
            avatar: initials(o.visit.patient.name),
            title: o.visit.patient.name,
            subtitle: `${o.items.length} test(s) · ${o.orderNo}`,
            state: o.state,
            meta: o.priority === "ROUTINE" ? undefined : o.priority,
            href: `/lab`,
            accent: priorityAccent(o.priority),
          }))}
          empty={{ title: "Worklist is empty", description: "Orders from doctors will appear here.", icon: CheckCircle2 }}
        />
      </Panel>
    );
    sidePanels = (
      <div className="flex flex-col gap-4">
        <Panel title="Results ready for doctors" icon={CheckCircle2}>
          <BigStat value={count("LAB_RESULTS_READY")} label="orders returned and awaiting review" />
        </Panel>
        <MyDay
          lines={[
            { label: "Open orders", value: openLabOrders },
            { label: "Results ready", value: count("LAB_RESULTS_READY") },
          ]}
          actions={[{ href: "/lab", label: "Laboratory worklist" }]}
        />
      </div>
    );
  } else if (role === "RECEPTIONIST") {
    primaryPanel = (
      <Panel
        title="Today's appointments"
        description={format(now, "EEEE, d MMMM")}
        icon={CalendarDays}
        action={{ label: "All appointments", href: "/appointments" }}
        className="lg:col-span-2"
      >
        <ActivityFeed
          items={todaysAppointments.map((a) => ({
            id: a.id,
            avatar: initials(a.patient.name),
            title: a.patient.name,
            subtitle: a.reason ?? (a.provider ? `with ${a.provider.name}` : "General"),
            state: a.state,
            meta: format(a.scheduledFor, "HH:mm"),
            href: `/appointments`,
          }))}
          empty={{ title: "No appointments today", description: "Scheduled visits will show up here.", icon: CalendarDays }}
        />
      </Panel>
    );
    sidePanels = (
      <div className="flex flex-col gap-4">
        <Panel title="Live registrations" icon={UserPlus}>
          <BigStat value={registrationsToday} label="patients registered today" />
        </Panel>
        <MyDay
          lines={[
            { label: "Registered today", value: registrationsToday },
            { label: "Appointments today", value: todaysAppointments.length },
            { label: "In the clinic now", value: activeTotal },
          ]}
          actions={[
            { href: "/reception", label: "Register a patient" },
            { href: "/appointments", label: "Book an appointment" },
          ]}
        />
      </div>
    );
  } else if (role === "HR") {
    primaryPanel = (
      <Panel
        title="Leave requests"
        description="Awaiting your decision"
        icon={ClipboardList}
        action={{ label: "Open HR", href: "/hr/leave" }}
        className="lg:col-span-2"
      >
        <ActivityFeed
          items={leaveQueue.map((l) => ({
            id: l.id,
            avatar: initials(l.employee.name),
            title: l.employee.name,
            subtitle: `${l.type} · ${format(l.startDate, "d MMM")} – ${format(l.endDate, "d MMM")}`,
            state: l.state,
            href: `/hr/leave`,
          }))}
          empty={{ title: "No pending requests", description: "New leave requests will appear here.", icon: CheckCircle2 }}
        />
      </Panel>
    );
    sidePanels = (
      <div className="flex flex-col gap-4">
        <Panel title="Workforce" icon={Users}>
          <BigStat value={activeStaff} label="active staff on the roster" />
        </Panel>
        <MyDay
          lines={[{ label: "Pending leave", value: pendingLeaves }, { label: "Active staff", value: activeStaff }]}
          actions={[{ href: "/hr/leave", label: "Leave requests" }, { href: "/staff", label: "Staff directory" }]}
        />
      </div>
    );
  } else if (role === "STORE_KEEPER") {
    primaryPanel = (
      <Panel
        title="Supply requests"
        description="Awaiting fulfilment"
        icon={ClipboardList}
        action={{ label: "Open store", href: "/store" }}
        className="lg:col-span-2"
      >
        <ActivityFeed
          items={stockRequestsQueue.map((r) => ({
            id: r.id,
            avatar: initials(r.requester.name),
            title: r.itemName,
            subtitle: `${r.quantity} unit(s) · ${r.requester.name}`,
            state: r.state,
            href: `/store`,
          }))}
          empty={{ title: "No open requests", description: "Supply requests from staff will appear here.", icon: CheckCircle2 }}
        />
      </Panel>
    );
    sidePanels = (
      <div className="flex flex-col gap-4">
        <Panel title="Pharmacy stock alerts" icon={PackageX} accent={lowStockCount > 0}>
          <LowStockList items={lowStockList.slice(0, 6)} total={lowStockCount} />
        </Panel>
        <MyDay
          lines={[{ label: "Open requests", value: stockRequestsQueue.length }]}
          actions={[{ href: "/store", label: "Store & assets" }]}
        />
      </div>
    );
  } else if (role === "NURSE") {
    const triage = activeVisits.filter((v) => v.state === "REGISTERED" || v.state === "TRIAGE");
    primaryPanel = (
      <Panel
        title="Triage & vitals"
        description="Patients waiting to be assessed"
        icon={Activity}
        action={{ label: "Open triage", href: "/triage" }}
        className="lg:col-span-2"
      >
        <ActivityFeed
          items={visitFeed(triage.length ? triage : activeVisits)}
          empty={{ title: "No one waiting", description: "Newly registered patients will appear here.", icon: CheckCircle2 }}
        />
      </Panel>
    );
    sidePanels = (
      <div className="flex flex-col gap-4">
        <Panel title="Ward occupancy" icon={BedDouble}>
          <RadialGauge value={occupiedBeds} max={totalBeds} label="Beds occupied" caption="across all wards" />
        </Panel>
        <MyDay
          lines={[{ label: "Awaiting triage", value: count("REGISTERED") + count("TRIAGE") }, { label: "Admitted", value: admitted }]}
          actions={[{ href: "/triage", label: "Triage queue" }, { href: "/wards", label: "Wards & beds" }]}
        />
      </div>
    );
  } else {
    // MANAGER (and any fallback) — clinic-wide operations view
    primaryPanel = (
      <Panel
        title="Active patient queue"
        description="Everyone currently moving through the clinic"
        icon={Layers}
        action={{ label: "All patients", href: "/patients" }}
        className="lg:col-span-2"
      >
        <ActivityFeed
          items={visitFeed(activeVisits)}
          empty={{ title: "No active visits", description: "New visits appear here as reception registers patients.", icon: Users }}
        />
      </Panel>
    );
    sidePanels = (
      <div className="flex flex-col gap-4">
        <Panel title="Wards" icon={BedDouble}>
          <RadialGauge value={occupiedBeds} max={totalBeds} label="Beds occupied" caption="live occupancy" />
        </Panel>
        <Panel title="Operations" icon={Sparkles}>
          <dl className="grid grid-cols-2 gap-3">
            <MiniStat label="Revenue today" value={birr(revenueToday)} />
            <MiniStat label="Staff on duty" value={activeStaff} />
            <MiniStat label="Open lab orders" value={openLabOrders} />
            <MiniStat label="To dispense" value={openDrugOrders} />
          </dl>
          {pendingLeaves > 0 && (
            <Link href="/hr/leave" className="mt-3 flex items-center justify-between rounded-lg bg-gold-soft px-3 py-2 text-xs font-medium text-gold-soft-foreground transition-colors hover:opacity-90">
              {pendingLeaves} leave request(s) awaiting your decision
              <ArrowRight className="size-3.5" />
            </Link>
          )}
        </Panel>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Hero band ─────────────────────────────────────────────────────── */}
      <section className="bg-brand-gradient relative overflow-hidden rounded-2xl px-6 py-7 text-white sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute -right-16 -top-24 size-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 right-1/3 size-64 rounded-full bg-gold/20 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs font-medium text-white/70">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 ring-1 ring-white/15">
                <span className="size-1.5 rounded-full bg-success" />
                {roleLabel(role)}
              </span>
              <span className="hidden sm:inline">{format(now, "EEEE, d MMMM yyyy")}</span>
            </div>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-balance sm:text-[28px]">
              {greeting()}, {firstName}
            </h1>
            <p className="mt-1.5 max-w-md text-sm text-white/70">
              Here is how the clinic is running right now — your live command center.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:max-w-md lg:w-auto">
            <HeroStat icon={Activity} label="In the clinic" value={activeTotal} />
            <HeroStat icon={CheckCircle2} label="Completed" value={completedToday} />
            <HeroStat icon={Layers} label="Open orders" value={openLabOrders + openDrugOrders} />
          </div>
        </div>
      </section>

      {/* ── KPI strip ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <MetricTile label="Waiting for doctor" value={count("WAITING_FOR_DOCTOR")} icon={Stethoscope} tone="warning" href="/doctor" />
        <MetricTile label="In consultation" value={count("IN_CONSULTATION")} icon={Users} tone="info" href="/doctor" />
        <MetricTile label="Awaiting lab" value={count("WAITING_FOR_LAB")} icon={FlaskConical} tone="brand" href="/lab" />
        <MetricTile label="Awaiting pharmacy" value={count("WAITING_FOR_PHARMACY")} icon={Pill} tone="brand" href="/pharmacy" />
        <MetricTile label="Admitted" value={admitted} icon={BedDouble} tone="info" href="/wards" />
        <MetricTile
          label="Low / out of stock"
          value={lowStockCount}
          icon={AlertTriangle}
          tone={lowStockCount > 0 ? "danger" : "success"}
          href="/pharmacy"
        />
      </div>

      {/* ── Trend + flow bento ────────────────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-6">
        <Panel
          title="Visits · last 7 days"
          icon={TrendingUp}
          className="lg:col-span-4"
          action={{ label: "Reports", href: "/reports" }}
        >
          <div className="mb-1 flex items-end gap-2">
            <span className="text-3xl font-semibold tabular-nums leading-none tracking-tight text-foreground">
              {weekTotal}
            </span>
            <span className="pb-0.5 text-xs text-muted-foreground">visits this week</span>
          </div>
          <Sparkline data={spark} />
        </Panel>
        <Panel title="Patient flow" description="Where everyone is right now" icon={Activity} className="lg:col-span-2">
          <FlowFunnel stages={flow} />
        </Panel>
      </div>

      {/* ── Role-tailored bento ───────────────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-3">
        {primaryPanel}
        {sidePanels}
      </div>
    </div>
  );
}

/* ── Small presentational helpers (server-only, colocated) ──────────────── */

function HeroStat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl bg-white/10 p-3 ring-1 ring-white/15 backdrop-blur-sm">
      <Icon className="size-4 text-white/60" />
      <div className="mt-2 text-2xl font-semibold tabular-nums leading-none">{value}</div>
      <div className="mt-1 text-[11px] font-medium text-white/60">{label}</div>
    </div>
  );
}

function BigStat({ value, label }: { value: number; label: string }) {
  return (
    <div className="py-1">
      <div className="text-4xl font-semibold tabular-nums tracking-tight text-foreground">{value}</div>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-muted/60 px-3 py-2.5">
      <dd className="text-lg font-semibold tabular-nums tracking-tight text-foreground">{value}</dd>
      <dt className="mt-0.5 text-xs text-muted-foreground">{label}</dt>
    </div>
  );
}

function LowStockList({
  items,
  total,
}: {
  items: { id: string; name: string; strength: string | null; onHand: number; reorderLevel: number }[];
  total: number;
}) {
  if (items.length === 0) {
    return <p className="py-2 text-sm text-muted-foreground">All medications are above reorder level.</p>;
  }
  return (
    <div className="space-y-2.5">
      {items.map((m) => (
        <Link
          key={m.id}
          href="/pharmacy"
          className="flex items-center justify-between gap-3 rounded-lg px-1 py-0.5 transition-colors hover:bg-muted"
        >
          <div className="min-w-0">
            <div className="truncate text-sm font-medium text-foreground">
              {m.name}
              {m.strength ? <span className="text-muted-foreground"> · {m.strength}</span> : null}
            </div>
            <div className="text-xs text-muted-foreground">reorder at {m.reorderLevel}</div>
          </div>
          <span
            className={
              m.onHand === 0
                ? "shrink-0 rounded-full bg-destructive/15 px-2 py-0.5 text-xs font-semibold tabular-nums text-destructive"
                : "shrink-0 rounded-full bg-warning/15 px-2 py-0.5 text-xs font-semibold tabular-nums text-warning"
            }
          >
            {m.onHand} left
          </span>
        </Link>
      ))}
      {total > items.length && (
        <p className="pt-1 text-xs text-muted-foreground">+{total - items.length} more below reorder level</p>
      )}
    </div>
  );
}

function MyDay({
  lines,
  actions,
}: {
  lines: { label: string; value: number }[];
  actions: { href: string; label: string }[];
}) {
  return (
    <Panel title="My day" icon={CalendarDays}>
      <dl className="space-y-2">
        {lines.map((l) => (
          <div key={l.label} className="flex items-center justify-between text-sm">
            <dt className="text-muted-foreground">{l.label}</dt>
            <dd className="font-semibold tabular-nums text-foreground">{l.value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-4 space-y-1.5">
        {actions.map((a) => (
          <Link
            key={a.label}
            href={a.href}
            className="group flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm transition-colors hover:border-primary/40 hover:bg-accent"
          >
            {a.label}
            <ArrowRight className="size-4 text-muted-foreground transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5" />
          </Link>
        ))}
      </div>
    </Panel>
  );
}
