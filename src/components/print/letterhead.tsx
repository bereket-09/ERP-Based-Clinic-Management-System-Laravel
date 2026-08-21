import { LogoMark } from "@/components/brand";
import type { Branding } from "@/server/services/settings";

/**
 * Formal clinic letterhead for printed documents. Reads from getBranding()
 * (passed in) so white-labeling flows through every printout.
 */
export function Letterhead({
  branding,
  contact,
}: {
  branding: Branding;
  contact?: string;
}) {
  return (
    <header className="flex items-start justify-between gap-4 border-b-2 border-slate-800 pb-4">
      <div className="flex items-start gap-3">
        <LogoMark className="size-12 shrink-0" />
        <div className="leading-tight">
          <div className="font-serif text-xl font-bold tracking-tight text-slate-900">
            {branding.orgName}
          </div>
          <div className="text-[13px] font-medium text-slate-600">{branding.appName}</div>
          {contact && <div className="mt-0.5 text-[11px] text-slate-500">{contact}</div>}
        </div>
      </div>
    </header>
  );
}

/** Small labeled field used across document bodies. */
export function Field({
  label,
  value,
  className,
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="text-[13px] text-slate-900">{value || "—"}</div>
    </div>
  );
}

/** Signature block with a rule the signer writes over. */
export function SignatureLine({
  name,
  role,
  label = "Signature",
}: {
  name?: string | null;
  role?: string | null;
  label?: string;
}) {
  return (
    <div className="min-w-[220px]">
      <div className="mb-1 h-10" />
      <div className="border-t border-slate-400 pt-1">
        <div className="text-[13px] font-semibold text-slate-900">{name || "________________"}</div>
        {role && <div className="text-[11px] text-slate-600">{role}</div>}
        <div className="mt-0.5 text-[10px] uppercase tracking-wide text-slate-400">{label}</div>
      </div>
    </div>
  );
}

/**
 * Tamper-evident verification seal: a QR pointing at /verify/<code> plus the
 * human-readable code. Proves the printout is genuine and unaltered.
 */
export function VerifySeal({
  qrDataUrl,
  code,
  url,
}: {
  qrDataUrl: string;
  code: string;
  url: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-slate-300 bg-slate-50 p-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={qrDataUrl} alt="Verification QR code" className="size-20 shrink-0" />
      <div className="leading-tight">
        <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          Scan to verify
        </div>
        <div className="text-[13px] font-semibold text-slate-900">Authentic document</div>
        <div className="mt-1 font-mono text-[12px] font-medium tracking-widest text-slate-800">
          {code}
        </div>
        <div className="mt-0.5 text-[9px] text-slate-500 break-all">{url}</div>
      </div>
    </div>
  );
}

/** Footer with document reference + issue date. */
export function DocFooter({ docNo, issuedAt }: { docNo: string; issuedAt: Date }) {
  return (
    <footer className="mt-8 flex items-center justify-between border-t border-slate-200 pt-3 text-[10px] text-slate-500">
      <span>
        Ref: <span className="font-mono font-medium text-slate-700">{docNo}</span>
      </span>
      <span>
        Issued:{" "}
        {issuedAt.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}
      </span>
    </footer>
  );
}
