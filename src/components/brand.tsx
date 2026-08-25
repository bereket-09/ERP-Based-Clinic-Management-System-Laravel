import { cn } from "@/lib/utils";

/** Official Dire Dawa University clinic mark, on a white chip so it stays
 *  legible on the navy sidebar, in dark mode, and on printed letterheads. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5",
        className,
      )}
      aria-hidden
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/ddu-logo.png" alt="" className="size-[84%] object-contain" />
    </span>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LogoMark className="size-9" />
      <div className="leading-tight">
        <div className="text-[15px] font-semibold tracking-tight">DDU Clinic</div>
        <div className="text-[11px] text-muted-foreground">Student Clinic Center</div>
      </div>
    </div>
  );
}
