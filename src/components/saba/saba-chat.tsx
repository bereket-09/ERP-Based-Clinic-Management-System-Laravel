"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { Sparkles, Send, Loader2, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Msg { role: "user" | "assistant"; content: string }

/** Render Saba's markdown-ish output: [label](/path) → CTA link, **bold** → strong. */
function renderRich(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1] && m[2]) {
      const href = m[2];
      const label = m[1];
      const cls =
        "mx-0.5 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary align-baseline transition-colors hover:bg-primary/20";
      out.push(
        href.startsWith("/") ? (
          <Link key={k++} href={href} className={cls}>
            {label} <ArrowUpRight className="size-3" />
          </Link>
        ) : (
          <a key={k++} href={href} className={cls} target="_blank" rel="noopener noreferrer">
            {label} <ArrowUpRight className="size-3" />
          </a>
        ),
      );
    } else if (m[3]) {
      out.push(<strong key={k++}>{m[3]}</strong>);
    }
    last = re.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function SabaChat({
  scope,
  patientId,
  visitId,
  suggestions = [],
  greeting,
  className,
  bare = false,
}: {
  scope: "staff" | "student";
  patientId?: string;
  visitId?: string;
  suggestions?: string[];
  greeting?: string;
  className?: string;
  /** Hide the internal header (the floating widget supplies its own chrome). */
  bare?: boolean;
}) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  async function send(text: string) {
    const q = text.trim();
    if (!q || busy) return;
    setInput("");
    const next: Msg[] = [...messages, { role: "user", content: q }];
    setMessages([...next, { role: "assistant", content: "" }]);
    setBusy(true);
    try {
      const res = await fetch("/api/saba", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scope, patientId, visitId, messages: next }),
      });
      if (!res.ok || !res.body) {
        const err = await res.text().catch(() => "Saba is unavailable.");
        setMessages((m) => { const c = [...m]; c[c.length - 1] = { role: "assistant", content: `⚠️ ${err}` }; return c; });
        return;
      }
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });
        setMessages((m) => { const c = [...m]; c[c.length - 1] = { role: "assistant", content: acc }; return c; });
      }
    } catch {
      setMessages((m) => { const c = [...m]; c[c.length - 1] = { role: "assistant", content: "⚠️ Could not reach Saba." }; return c; });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={cn("flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card", className)}>
      {/* Header (omitted when the floating widget supplies its own chrome) */}
      {!bare && (
        <div className="flex items-center gap-2.5 border-b border-border px-4 py-3">
          <span className="flex size-8 items-center justify-center rounded-full bg-[#0c1f3d] text-[#e0a112]">
            <Sparkles className="size-4" strokeWidth={1.5} />
          </span>
          <div className="leading-tight">
            <div className="text-sm font-semibold">Saba</div>
            <div className="text-[11px] text-muted-foreground">
              {scope === "staff" ? "Your clinic assistant" : "Your caring health guide"}
            </div>
          </div>
          <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">AI · verify advice</span>
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="space-y-4">
            <div className="flex gap-2.5">
              <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-[#0c1f3d] text-[#e0a112]"><Sparkles className="size-3.5" strokeWidth={1.5} /></span>
              <p className="rounded-2xl rounded-tl-sm bg-muted px-3.5 py-2.5 text-sm leading-relaxed">
                {greeting ?? (scope === "staff"
                  ? "Hi, I'm Saba — your read-only clinic assistant. Ask me what's in your queue, stock levels, who's on leave, or about the patient on screen. For anything you need to do, I'll point you to the right page. I stick to clinic matters only."
                  : "Hi, I'm Saba 🌸 I'm here to help you feel better. Tell me how you're feeling and I'll share gentle advice — and let you know when it's best to visit the clinic.")}
              </p>
            </div>
            {suggestions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <button key={s} onClick={() => send(s)} className="rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground">
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={cn("flex gap-2.5", m.role === "user" && "flex-row-reverse")}>
            {m.role === "assistant" && (
              <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-[#0c1f3d] text-[#e0a112]"><Sparkles className="size-3.5" strokeWidth={1.5} /></span>
            )}
            <div className={cn(
              "max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
              m.role === "user" ? "rounded-tr-sm bg-primary text-primary-foreground" : "rounded-tl-sm bg-muted text-foreground",
            )}>
              {m.content
                ? m.role === "assistant" ? renderRich(m.content) : m.content
                : busy && i === messages.length - 1
                  ? <Loader2 className="size-4 animate-spin text-muted-foreground" />
                  : ""}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => { e.preventDefault(); send(input); }}
        className="flex items-center gap-2 border-t border-border p-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={scope === "staff" ? "Ask Saba…" : "Tell Saba how you're feeling…"}
          className="min-w-0 flex-1 rounded-full border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary/50"
          disabled={busy}
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform active:scale-95 disabled:opacity-40"
          aria-label="Send"
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" strokeWidth={1.75} />}
        </button>
      </form>
    </div>
  );
}
