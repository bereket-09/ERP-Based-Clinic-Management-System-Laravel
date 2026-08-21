"use client";
import Link from "next/link";
import { useActionState } from "react";
import { AlertCircle, Loader2, LogIn, ShieldCheck } from "lucide-react";
import { staffLogin, type LoginState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function StaffLoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(staffLogin, {});
  const mfa = state.mfaRequired;

  return (
    <form action={action} className="space-y-4">
      {state.error && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      {/* Email + password stay mounted (values persist) but collapse during the MFA step. */}
      <div className={mfa ? "pointer-events-none space-y-4 opacity-50" : "space-y-4"}>
        <div className="space-y-1.5">
          <Label htmlFor="email">Work email</Label>
          <Input id="email" name="email" type="email" autoComplete="username" placeholder="you@clinic.test" required readOnly={mfa} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" autoComplete="current-password" placeholder="••••••••" required readOnly={mfa} />
        </div>
      </div>

      {mfa && (
        <div className="space-y-1.5 rounded-lg border border-primary/25 bg-primary/5 p-3">
          <div className="flex items-center gap-2 text-sm font-medium text-primary">
            <ShieldCheck className="size-4" /> Two-factor authentication
          </div>
          <p className="text-xs text-muted-foreground">
            Enter the 6-digit code from your authenticator app — or one of your recovery codes.
          </p>
          <Label htmlFor="token" className="sr-only">Authentication code</Label>
          <Input
            id="token"
            name="token"
            inputMode="text"
            autoComplete="one-time-code"
            placeholder="123 456"
            autoFocus
            required
          />
        </div>
      )}

      <Button type="submit" variant="primary" size="lg" className="w-full" disabled={pending}>
        {pending ? <Loader2 className="animate-spin" /> : mfa ? <ShieldCheck /> : <LogIn />}
        {pending ? "Signing in…" : mfa ? "Verify & sign in" : "Sign in"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Are you a student?{" "}
        <Link href="/student-login" className="font-medium text-primary hover:underline">
          Use the student portal
        </Link>
      </p>
    </form>
  );
}
