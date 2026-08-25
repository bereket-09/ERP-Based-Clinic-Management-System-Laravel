import { getActor } from "@/server/session";
import { isFeatureEnabled } from "@/server/services/settings";
import {
  getSabaConfig,
  streamSaba,
  doctorSystemPrompt,
  studentSystemPrompt,
  buildDoctorContext,
  buildStudentContext,
  type ChatMessage,
} from "@/server/ai/saba";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Body {
  scope: "doctor" | "student";
  patientId?: string;
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
    if (actor.kind !== "staff" || !["DOCTOR", "NURSE", "MANAGER"].includes(actor.role ?? "")) {
      return new Response("Forbidden", { status: 403 });
    }
    const ctx = body.patientId ? await buildDoctorContext(body.patientId) : "";
    system = doctorSystemPrompt(ctx);
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
