"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, ArrowRight } from "lucide-react";
import { LogoMark } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function VerifyLandingPage() {
  const router = useRouter();
  const [code, setCode] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const clean = code.toUpperCase().replace(/[^0-9A-Z]/g, "");
    if (clean) router.push(`/verify/${clean}`);
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-4 py-10">
      <div className="mb-6 flex items-center gap-2.5">
        <LogoMark className="size-9" />
        <div>
          <div className="font-semibold leading-tight">DDU Clinic</div>
          <div className="text-xs text-muted-foreground">Document verification</div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ShieldCheck className="size-6" />
          </span>
          <div>
            <h1 className="text-lg font-semibold">Verify a clinic document</h1>
            <p className="text-sm text-muted-foreground">Enter the code printed on the certificate or letter.</p>
          </div>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="code">Verification code</Label>
            <Input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="ABCDE-FGHIJ"
              autoFocus
              autoComplete="off"
              className="font-mono tracking-widest uppercase"
            />
          </div>
          <Button type="submit" variant="primary" className="w-full" disabled={!code.trim()}>
            Verify <ArrowRight className="size-4" />
          </Button>
        </form>
      </div>
      <p className="mt-4 text-center text-xs text-muted-foreground">
        Verification confirms a sick-leave certificate, referral or other clinic document is genuine and unaltered.
      </p>
    </div>
  );
}
