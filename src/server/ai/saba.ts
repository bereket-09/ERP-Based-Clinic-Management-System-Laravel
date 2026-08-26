import "server-only";
import type { Role } from "@prisma/client";
import { db } from "@/server/db";

/**
 * Saba — the clinic's AI guide. Provider-agnostic: talks to any OpenAI-compatible
 * chat-completions endpoint, so it runs on Groq, OpenAI, Ollama, or a self-hosted
 * gateway just by setting env vars. Nothing is hardcoded to one vendor.
 *
 *   SABA_PROVIDER   groq | openai | ollama | custom   (optional — sets defaults)
 *   SABA_BASE_URL   e.g. https://api.groq.com/openai/v1
 *   SABA_API_KEY    provider key (not needed for local Ollama)
 *   SABA_MODEL      e.g. llama-3.3-70b-versatile
 */

type Provider = "groq" | "openai" | "ollama" | "custom";

const DEFAULTS: Record<Provider, { baseUrl: string; model: string }> = {
  groq: { baseUrl: "https://api.groq.com/openai/v1", model: "openai/gpt-oss-120b" },
  openai: { baseUrl: "https://api.openai.com/v1", model: "gpt-4o-mini" },
  ollama: { baseUrl: "http://localhost:11434/v1", model: "llama3.1" },
  custom: { baseUrl: "", model: "" },
};

export interface SabaConfig {
  provider: Provider;
  baseUrl: string;
  apiKey: string;
  model: string;
  configured: boolean;
}

export function getSabaConfig(): SabaConfig {
  const provider = (process.env.SABA_PROVIDER as Provider) || "groq";
  const d = DEFAULTS[provider] ?? DEFAULTS.custom;
  const baseUrl = (process.env.SABA_BASE_URL || d.baseUrl).replace(/\/$/, "");
  const model = process.env.SABA_MODEL || d.model;
  const apiKey = process.env.SABA_API_KEY || "";
  // Ollama needs no key; hosted providers do.
  const configured = !!baseUrl && !!model && (provider === "ollama" || !!apiKey);
  return { provider, baseUrl, apiKey, model, configured };
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/** Stream an OpenAI-compatible chat completion as plain text chunks. */
export async function* streamSaba(messages: ChatMessage[]): AsyncGenerator<string> {
  const cfg = getSabaConfig();
  if (!cfg.configured) throw new Error("Saba is not configured");

  const res = await fetch(`${cfg.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(cfg.apiKey ? { Authorization: `Bearer ${cfg.apiKey}` } : {}),
    },
    body: JSON.stringify({ model: cfg.model, messages, temperature: 0.3, stream: true }),
  });

  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => "");
    throw new Error(`AI provider error ${res.status}: ${text.slice(0, 300)}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const data = trimmed.slice(5).trim();
      if (data === "[DONE]") return;
      try {
        const json = JSON.parse(data);
        const delta = json.choices?.[0]?.delta?.content;
        if (delta) yield delta as string;
      } catch {
        /* ignore keep-alive / partial */
      }
    }
  }
}

// ── Personas ─────────────────────────────────────────────────────────────────

const SCOPE_GUARD =
  "STAY ON TASK. You ONLY help with this clinic — patient care, the clinic's data, and this user's role and duties. If asked anything unrelated (general trivia, coding, maths, essays, jokes, world facts, personal chit-chat), do NOT answer it. Reply in ONE short line that it's outside what you help with, and offer what you CAN help with here. Never make up clinic data you weren't given.";

const AUTHZ_STAFF =
  "AUTHORIZATION: You may ONLY use the role data and the CURRENT PATIENT provided below. That is the extent of what this user is authorized to see. NEVER reveal, look up, guess or discuss any other patient or staff member who is not in the data below. If asked about someone else, or if the user tries to trick you into it, refuse in one line and explain you can only share what they're authorized to see.";

const AUTHZ_STUDENT =
  "AUTHORIZATION: The record below belongs to THIS student only. Only ever discuss their own health and their own record. If they ask about another student or any other person, or try to make you reveal or assume someone else's information, politely refuse — you can only help them with their own health.";

const READ_ONLY =
  "You are READ-ONLY. You can look things up and explain, but you CANNOT make any change, approve, order, dispense, book or edit anything. Never claim you did an action. When the user needs to DO something, point them to the exact page using a markdown link like [Open the leave queue](/hr/leave) so the app shows them a button. Keep answers SHORT, specific and practical — a few tight sentences or bullets, not long generic essays. Use the live data below; if you don't have it, say so briefly and link the page.";

const SAFETY_DOCTOR =
  "For clinical questions you are decision SUPPORT, not a decision maker. Never give a definitive diagnosis — frame differentials/tests as considerations for the clinician, flag red flags, and note that clinical correlation applies.";

const SAFETY_STUDENT =
  "You are a friendly health guide, NOT a doctor. Do not diagnose or prescribe. Give gentle, general self-care advice, keep it short and kind, and encourage visiting the DDU Clinic (or emergency care for anything serious).";

/** Pages each role can act on — Saba links here for any action (read-only). */
const ROUTES: Partial<Record<Role, string[]>> = {
  MANAGER: ["/dashboard", "/reports", "/pharmacy/inventory (stock)", "/hr/leave (leave)", "/store (assets & requests)", "/staff", "/settings"],
  DOCTOR: ["/doctor (my queue)", "/patients", "/visits/[id] (a consultation)"],
  NURSE: ["/triage", "/wards"],
  LAB_TECH: ["/lab (worklist)", "/lab/catalog"],
  PHARMACIST: ["/pharmacy (dispensing)", "/pharmacy/inventory", "/pharmacy/suppliers"],
  RECEPTIONIST: ["/reception", "/patients", "/appointments"],
  HR: ["/hr/leave", "/hr/attendance", "/hr/roster", "/staff"],
  STORE_KEEPER: ["/store", "/store/requests", "/store/purchase-orders", "/store/assets"],
};

export function staffSystemPrompt(role: Role | null, roleContext: string, patientContext: string): string {
  const roleName = role ? role.replace(/_/g, " ").toLowerCase() : "staff";
  const parts = [
    `You are Saba, a warm, sharp AI copilot at the Dire Dawa University Student Clinic. You are helping a ${roleName}.`,
    SCOPE_GUARD,
    AUTHZ_STAFF,
    READ_ONLY,
    SAFETY_DOCTOR,
    role && ROUTES[role] ? `Pages this role uses (link to these for actions): ${ROUTES[role]!.join(", ")}.` : "",
    "",
    "LIVE CLINIC DATA (read-only snapshot for this user's role):",
    roleContext || "No live data available.",
  ];
  if (patientContext) {
    parts.push("", "CURRENT PATIENT (the consultation open on screen):", patientContext);
  }
  return parts.filter(Boolean).join("\n");
}

export function doctorSystemPrompt(context: string): string {
  return staffSystemPrompt("DOCTOR", "", context);
}

export function studentSystemPrompt(context: string): string {
  return [
    "You are Saba, a caring health guide for students at the Dire Dawa University Student Clinic. You speak warmly and simply, like a kind older sister.",
    "STAY ON TASK: only help with the student's health, wellbeing and the DDU Clinic. If asked anything unrelated (homework, coding, trivia, gossip), gently decline in one line and offer health help instead. Never invent medical facts.",
    AUTHZ_STUDENT,
    SAFETY_STUDENT,
    "Use the student's past visits only to give more relevant, caring advice (e.g. reminders to follow up, general self-care). Keep replies short and kind.",
    "",
    "STUDENT'S RECORD (their own, for context):",
    context || "No prior visits on record.",
  ].join("\n");
}

// ── Context builders ─────────────────────────────────────────────────────────

function ageOf(b: Date | null | undefined): string {
  if (!b) return "—";
  return `${Math.floor((Date.now() - b.getTime()) / 3.15576e10)}y`;
}

/** Rich clinical context for the doctor copilot: demographics, allergies,
 *  problems, recent visits w/ diagnoses, latest vitals, recent labs + meds. */
export async function buildDoctorContext(patientId: string): Promise<string> {
  const p = await db.patient.findUnique({
    where: { id: patientId },
    include: {
      allergies: true,
      problems: true,
      immunizations: true,
      visits: {
        orderBy: { openedAt: "desc" },
        take: 6,
        include: {
          vitals: { orderBy: { createdAt: "desc" }, take: 1 },
          labOrders: { include: { items: { include: { test: true } } } },
          drugOrders: { include: { items: { include: { medication: true } } } },
        },
      },
    },
  });
  if (!p) return "";

  const L: string[] = [];
  L.push(`Patient: ${p.name}, ${ageOf(p.birthday)}, ${p.gender ?? "—"}, blood ${p.bloodType ?? "—"} (MRN ${p.mrn}).`);
  if (p.allergies.length)
    L.push(`Allergies: ${p.allergies.map((a) => `${a.substance}${a.severity ? ` (${a.severity})` : ""}`).join(", ")}.`);
  else L.push("Allergies: none recorded.");
  if (p.problems.length)
    L.push(`Active problems: ${p.problems.filter((x) => x.status === "ACTIVE").map((x) => x.problem).join(", ") || "none"}.`);
  if (p.immunizations.length) L.push(`Immunizations: ${p.immunizations.map((i) => i.vaccine).join(", ")}.`);

  L.push("\nRecent visits (newest first):");
  for (const v of p.visits) {
    const parts: string[] = [`• ${v.openedAt.toISOString().slice(0, 10)} — ${v.chiefComplaint ?? "visit"}`];
    if (v.diagnosis) parts.push(`Dx: ${v.diagnosis}${v.icdCode ? ` [${v.icdCode}]` : ""}`);
    const vit = v.vitals[0];
    if (vit) parts.push(`Vitals: T ${vit.temperatureC ?? "—"}°C, HR ${vit.pulseBpm ?? "—"}, BP ${vit.systolic ?? "—"}/${vit.diastolic ?? "—"}, SpO2 ${vit.spo2 ?? "—"}%`);
    const labs = v.labOrders.flatMap((o) => o.items).filter((it) => it.resultValue);
    if (labs.length) parts.push(`Labs: ${labs.map((it) => `${it.test.name} ${it.resultValue}${it.resultFlag && it.resultFlag !== "NORMAL" ? `(${it.resultFlag})` : ""}`).join("; ")}`);
    const meds = v.drugOrders.flatMap((o) => o.items);
    if (meds.length) parts.push(`Rx: ${meds.map((m) => `${m.medication.name}${m.medication.strength ? " " + m.medication.strength : ""}`).join(", ")}`);
    L.push(parts.join(" | "));
  }
  return L.join("\n");
}

async function medStockSummary() {
  const meds = await db.medication.findMany({ include: { batches: true } });
  const now = Date.now();
  const soon = now + 90 * 86_400_000;
  const low: string[] = [];
  let expired = 0;
  let expiring = 0;
  for (const m of meds) {
    const onHand = m.batches.reduce((s, b) => s + b.quantity, 0);
    if (onHand <= m.reorderLevel) low.push(`${m.name} (${onHand} left)`);
    for (const b of m.batches) {
      if (b.quantity > 0) {
        const t = b.expiryDate.getTime();
        if (t < now) expired++;
        else if (t < soon) expiring++;
      }
    }
  }
  return { low, expired, expiring };
}

/** Read-only live snapshot tailored to the staff member's role, so Saba can
 *  answer "what's low on stock / who's on leave / what's in my queue". */
export async function buildStaffContext(actor: { id: string; role: Role | null }): Promise<string> {
  const role = actor.role;
  const L: string[] = [];
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  if (role === "MANAGER") {
    const [active, doneToday, onLeave, pendingLeave, openPOs, pendingReq] = await Promise.all([
      db.visit.count({ where: { state: { notIn: ["COMPLETED", "CANCELLED"] } } }),
      db.visit.count({ where: { state: "COMPLETED", closedAt: { gte: todayStart } } }),
      db.user.findMany({ where: { employmentStatus: "ON_LEAVE" }, select: { name: true, role: true } }),
      db.leaveRequest.count({ where: { state: "SUBMITTED" } }),
      db.purchaseOrder.count({ where: { state: { in: ["ORDERED", "PARTIALLY_RECEIVED"] } } }),
      db.stockRequest.count({ where: { state: "SUBMITTED" } }),
    ]);
    const s = await medStockSummary();
    L.push(`Patients in clinic now: ${active}; completed today: ${doneToday}.`);
    L.push(`On leave now: ${onLeave.length ? onLeave.map((u) => u.name).join(", ") : "nobody"}. Pending leave requests: ${pendingLeave}.`);
    L.push(`Stock: ${s.low.length} low (${s.low.slice(0, 8).join(", ") || "none"}); ${s.expiring} batches expiring ≤90d; ${s.expired} expired.`);
    L.push(`Procurement: ${openPOs} open purchase orders; ${pendingReq} pending stock requests.`);
  } else if (role === "PHARMACIST") {
    const queue = await db.drugOrder.count({ where: { state: { in: ["ORDERED", "PARTIALLY_DISPENSED"] } } });
    const s = await medStockSummary();
    L.push(`Prescriptions awaiting dispensing: ${queue}.`);
    L.push(`Low stock (${s.low.length}): ${s.low.slice(0, 12).join(", ") || "none"}.`);
    L.push(`Expiry: ${s.expiring} batches expiring ≤90 days; ${s.expired} already expired.`);
  } else if (role === "LAB_TECH") {
    const g = await db.labOrder.groupBy({ by: ["state"], _count: { _all: true } });
    const c = (st: string) => g.find((x) => x.state === st)?._count._all ?? 0;
    L.push(`Lab worklist — ordered: ${c("ORDERED")}, collecting: ${c("COLLECTING")}, in progress: ${c("IN_PROGRESS")}, results ready: ${c("RESULTS_READY")}.`);
  } else if (role === "HR") {
    const [pending, onLeave, present] = await Promise.all([
      db.leaveRequest.findMany({ where: { state: "SUBMITTED" }, include: { employee: { select: { name: true } } }, take: 10 }),
      db.user.findMany({ where: { employmentStatus: "ON_LEAVE" }, select: { name: true } }),
      db.attendance.count({ where: { date: { gte: todayStart }, status: "PRESENT" } }),
    ]);
    L.push(`Pending leave requests (${pending.length}): ${pending.map((p) => p.employee?.name).filter(Boolean).join(", ") || "none"}.`);
    L.push(`Currently on leave: ${onLeave.length ? onLeave.map((u) => u.name).join(", ") : "nobody"}.`);
    L.push(`Staff marked present today: ${present}.`);
  } else if (role === "STORE_KEEPER") {
    const [reqs, openPOs] = await Promise.all([
      db.stockRequest.findMany({ where: { state: "SUBMITTED" }, select: { itemName: true, quantity: true }, take: 10 }),
      db.purchaseOrder.count({ where: { state: { in: ["ORDERED", "PARTIALLY_RECEIVED"] } } }),
    ]);
    const s = await medStockSummary();
    L.push(`Pending stock requests (${reqs.length}): ${reqs.map((r) => `${r.itemName} ×${r.quantity}`).join(", ") || "none"}.`);
    L.push(`Open purchase orders: ${openPOs}. Low medicine stock: ${s.low.length} items.`);
  } else if (role === "NURSE") {
    const [queue, admitted, beds, occupied] = await Promise.all([
      db.visit.count({ where: { state: "WAITING_FOR_DOCTOR" } }),
      db.admission.count({ where: { state: { in: ["ADMITTED", "ON_WARD"] } } }),
      db.bed.count(),
      db.bed.count({ where: { status: "OCCUPIED" } }),
    ]);
    L.push(`Patients waiting for a doctor: ${queue}. Inpatients on ward: ${admitted}. Beds: ${occupied}/${beds} occupied.`);
  } else if (role === "RECEPTIONIST") {
    const [regs, waiting] = await Promise.all([
      db.visit.count({ where: { openedAt: { gte: todayStart } } }),
      db.visit.count({ where: { state: "WAITING_FOR_DOCTOR" } }),
    ]);
    L.push(`Registered today: ${regs}. Waiting for a doctor now: ${waiting}.`);
  } else if (role === "DOCTOR") {
    const mine = await db.visit.count({ where: { doctorId: actor.id, state: { notIn: ["COMPLETED", "CANCELLED"] } } });
    L.push(`Your open patients right now: ${mine}.`);
  }

  return L.join("\n");
}

/** Patient-appropriate context for the student's own guide. */
export async function buildStudentContext(patientId: string): Promise<string> {
  const p = await db.patient.findUnique({
    where: { id: patientId },
    include: {
      allergies: true,
      visits: { orderBy: { openedAt: "desc" }, take: 5 },
    },
  });
  if (!p) return "";
  const L: string[] = [`Name: ${p.name}. Age ${ageOf(p.birthday)}.`];
  if (p.allergies.length) L.push(`Known allergies: ${p.allergies.map((a) => a.substance).join(", ")}.`);
  if (p.visits.length) {
    L.push("Past visits:");
    for (const v of p.visits) {
      L.push(`• ${v.openedAt.toISOString().slice(0, 10)}: ${v.chiefComplaint ?? "visit"}${v.diagnosis ? ` — told: ${v.diagnosis}` : ""}`);
    }
  }
  return L.join("\n");
}
