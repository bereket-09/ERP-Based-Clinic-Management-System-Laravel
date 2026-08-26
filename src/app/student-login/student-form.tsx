"use client";
import Link from "next/link";
import { useActionState } from "react";
import { AlertCircle, GraduationCap, Loader2 } from "lucide-react";
import { studentLogin, type LoginState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function StudentLoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(studentLogin, {});

  return (
    <form action={action} className="space-y-4">
      {state.error && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="studentId">Student ID</Label>
        <Input id="studentId" name="studentId" placeholder="DDU/1001/14" autoComplete="username" required />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" autoComplete="current-password" placeholder="••••••••" required />
      </div>

      <Button type="submit" variant="primary" size="lg" className="w-full" disabled={pending}>
        {pending ? <Loader2 className="animate-spin" /> : <GraduationCap />}
        {pending ? "Signing in…" : "Enter student portal"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Staff member?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Staff sign in
        </Link>
      </p>
    </form>
  );
}
