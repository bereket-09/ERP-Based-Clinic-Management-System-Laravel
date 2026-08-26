import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getActor } from "@/server/session";
import { AuthSplit } from "@/components/auth-split";
import { StaffLoginForm } from "./login-form";

export const metadata: Metadata = { title: "Staff sign in" };

export default async function LoginPage() {
  const actor = await getActor();
  if (actor?.kind === "staff") redirect("/dashboard");
  if (actor?.kind === "student") redirect("/portal");

  return (
    <AuthSplit eyebrow="Staff portal" heading="Sign in to your workspace">
      <StaffLoginForm />

      <div className="mt-8 rounded-lg border border-dashed border-border bg-muted/40 p-3 text-xs text-muted-foreground">
        <p className="font-medium text-foreground">Demo accounts · password “password”</p>
        <p className="mt-1 leading-relaxed">
          manager@ · doctor@ · reception@ · lab@ · pharmacy@ · nurse@ · hr@ · store@
          <span className="text-muted-foreground/70"> clinic.test</span>
        </p>
      </div>
    </AuthSplit>
  );
}
