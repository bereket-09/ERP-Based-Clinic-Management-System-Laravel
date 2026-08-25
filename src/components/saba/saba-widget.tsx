"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Sparkles, X, Maximize2, Minimize2 } from "lucide-react";
import { SabaChat } from "./saba-chat";
import { cn } from "@/lib/utils";

/**
 * Floating "Ask Saba" chat — a contact-us-style bubble that opens a popup the
 * user can expand to full screen or shrink back. For doctors it auto-detects the
 * patient from the current /visits/[id] route so answers stay in context.
 */
export function SabaWidget({
  scope,
  suggestions,
}: {
  scope: "staff" | "student";
  suggestions?: string[];
}) {
  const [open, setOpen] = useState(false);
  const [full, setFull] = useState(false);
  const pathname = usePathname();
  const visitId =
    scope === "staff" ? pathname?.match(/\/visits\/([^/?#]+)/)?.[1] : undefined;

  return (
    <>
      {/* Launcher */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Ask Saba"
          className="group fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-[#0c1f3d] py-3 pl-3.5 pr-5 text-white shadow-[0_12px_40px_-8px_rgba(12,31,61,0.6)] transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.03] active:scale-95"
        >
          <span className="relative flex size-7 items-center justify-center rounded-full bg-white/10 text-[#e0a112]">
            <Sparkles className="size-4" strokeWidth={1.5} />
            <span className="absolute inset-0 animate-ping rounded-full bg-[#e0a112]/20" />
          </span>
          <span className="text-sm font-medium">Ask Saba</span>
        </button>
      )}

      {/* Popup */}
      {open && (
        <div
          className={cn(
            "fixed z-50 flex flex-col overflow-hidden border border-border bg-card shadow-[0_24px_80px_-16px_rgba(12,31,61,0.55)] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
            full
              ? "inset-3 rounded-3xl sm:inset-5 lg:inset-8"
              : "bottom-5 right-5 h-[600px] max-h-[calc(100dvh-2.5rem)] w-[calc(100vw-2.5rem)] max-w-[460px] rounded-3xl",
          )}
        >
          {/* Chrome */}
          <div className="flex items-center gap-2.5 border-b border-border bg-[#0c1f3d] px-4 py-3 text-white">
            <span className="flex size-8 items-center justify-center rounded-full bg-white/10 text-[#e0a112]">
              <Sparkles className="size-4" strokeWidth={1.5} />
            </span>
            <div className="leading-tight">
              <div className="text-sm font-semibold">Saba</div>
              <div className="text-[11px] text-white/55">
                {scope === "staff" ? (visitId ? "Clinic assistant · this patient" : "Clinic assistant") : "Your health guide"}
              </div>
            </div>
            <div className="ml-auto flex items-center gap-0.5">
              <button
                onClick={() => setFull((f) => !f)}
                aria-label={full ? "Shrink" : "Full screen"}
                className="flex size-8 items-center justify-center rounded-lg text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              >
                {full ? <Minimize2 className="size-4" strokeWidth={1.75} /> : <Maximize2 className="size-4" strokeWidth={1.75} />}
              </button>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="flex size-8 items-center justify-center rounded-lg text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="size-4" strokeWidth={1.75} />
              </button>
            </div>
          </div>

          <SabaChat
            scope={scope}
            visitId={visitId}
            suggestions={suggestions}
            bare
            className="min-h-0 flex-1 rounded-none border-0"
          />
        </div>
      )}
    </>
  );
}
