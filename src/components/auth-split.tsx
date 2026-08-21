import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { LogoMark } from "@/components/brand";

const HIGHLIGHTS = [
  "Real-time patient queues from reception to pharmacy",
  "Guided clinical workflow — the system shows the next right action",
  "Lab, pharmacy stock, wards, referrals & printable documents",
];

export function AuthSplit({
  eyebrow,
  heading,
  children,
}: {
  eyebrow: string;
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* Brand panel */}
      <div className="bg-brand-gradient relative hidden flex-col justify-between overflow-hidden p-10 text-white lg:flex">
        <Link href="/" className="flex items-center gap-3">
          <LogoMark className="size-11 bg-white/15 backdrop-blur" />
          <div className="leading-tight">
            <div className="font-semibold">DDU Clinic</div>
            <div className="text-sm text-white/70">Student Clinic Center</div>
          </div>
        </Link>

        <div className="max-w-md">
          <h2 className="text-3xl font-semibold leading-tight text-balance">
            One secure system for the entire campus clinic.
          </h2>
          <ul className="mt-8 space-y-3">
            {HIGHLIGHTS.map((h) => (
              <li key={h} className="flex items-start gap-3 text-white/85">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-white/70" />
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-sm text-white/50">Dire Dawa University · {new Date().getFullYear()}</p>

        <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 size-80 rounded-full bg-black/10 blur-3xl" />
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-background p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <LogoMark className="size-11" />
          </div>
          <p className="text-sm font-medium text-primary">{eyebrow}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">{heading}</h1>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
