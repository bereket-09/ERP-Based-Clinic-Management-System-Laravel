import { getActor } from "@/server/session";
import { db } from "@/server/db";
import { isFeatureEnabled } from "@/server/services/settings";
import {
  getSabaConfig,
  streamSaba,
  staffSystemPrompt,
  studentSystemPrompt,
  buildStaffContext,
  buildDoctorContext,
  buildStudentContext,
  type ChatMessage,
} from "@/server/ai/saba";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Body {
  scope: "staff" | "doctor" | "student";
  patientId?: string;
  visitId?: string;
  messages: ChatMessage[];
}

export async function POST(req: Request) {
  const actor = await getActor();
  if (!actor) return new Response("Unauthorized", { status: 401 });

  if (!(await isFeatureEnabled("ai.assistant"))) {
    return new Response("Saba is turned off for this clinic.", { status: 403 });
  }
  if (!getSabaConfig().configured) {
    return new Response("Saba has no AI provider configured. Set SABA_API_KEY / SABA_MODEL.", { status: 503 });
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return new Response("Bad request", { status: 400 });
  }
  const history = (body.messages ?? []).filter((m) => m.role === "user" || m.role === "assistant").slice(-12);
  if (history.length === 0) return new Response("No message", { status: 400 });

  // Build the role-appropriate system prompt + context, enforcing ownership.
  let system: string;
  if (body.scope === "student") {
    if (actor.kind !== "student") return new Response("Forbidden", { status: 403 });
    system = studentSystemPrompt(await buildStudentContext(actor.id));
  } else {
    if (actor.kind !== "staff") return new Response("Forbidden", { status: 403 });
    // Deep clinical patient context is only for clinical roles, and only for a
    // REAL visit the user opened on screen — never a client-supplied patientId.
    const CLINICAL = ["DOCTOR", "NURSE", "MANAGER"];
    let patientCtx = "";
    if (body.visitId && CLINICAL.includes(actor.role ?? "")) {
      const v = await db.visit.findUnique({ where: { id: body.visitId }, select: { patientId: true } });
      if (v) patientCtx = await buildDoctorContext(v.patientId);
    }
    const roleCtx = await buildStaffContext({ id: actor.id, role: actor.role });
    system = staffSystemPrompt(actor.role, roleCtx, patientCtx);
  }

  const messages: ChatMessage[] = [{ role: "system", content: system }, ...history];

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of streamSaba(messages)) {
          controller.enqueue(encoder.encode(chunk));
        }
      } catch (e) {
        controller.enqueue(encoder.encode(`\n\n⚠️ ${(e as Error).message}`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}
