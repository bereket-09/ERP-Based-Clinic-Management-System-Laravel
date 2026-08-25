import "server-only";
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

const SAFETY_DOCTOR =
  "You are decision SUPPORT, not a decision maker. Never give definitive diagnoses. Frame everything as considerations for the clinician's judgement, flag red flags, and remind that clinical correlation and local guidelines apply.";

const SAFETY_STUDENT =
  "You are a friendly health guide, NOT a doctor. Do not diagnose or prescribe. Give gentle, general self-care and wellbeing advice, and always encourage the student to visit the DDU Clinic (or emergency care for anything serious). Be warm and reassuring.";

export function doctorSystemPrompt(context: string): string {
  return [
    "You are Saba, a warm, sharp clinical AI copilot at the Dire Dawa University Student Clinic. You assist doctors.",
    SAFETY_DOCTOR,
    "When helpful, suggest: relevant differentials to consider, focused history/exam points, appropriate lab tests or investigations to order, and management/care considerations. Reference the patient's own history when relevant. Be concise and structured (short headings, bullet points).",
    "",
    "PATIENT CONTEXT (from the clinic record):",
    context || "No structured record was provided.",
  ].join("\n");
}

export function studentSystemPrompt(context: string): string {
  return [
    "You are Saba, a caring health guide for students at the Dire Dawa University Student Clinic. You speak warmly and simply, like a kind older sister.",
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
