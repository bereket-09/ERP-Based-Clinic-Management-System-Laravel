import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getActor } from "@/server/session";
import { AuthSplit } from "@/components/auth-split";
import { StudentLoginForm } from "./student-form";

export const metadata: Metadata = { title: "Student portal sign in" };

export default async function StudentLoginPage() {
  const actor = await getActor();
  if (actor?.kind === "student") redirect("/portal");
  if (actor?.kind === "staff") redirect("/dashboard");

  return (
    <AuthSplit eyebrow="Student portal" heading="Access your health records">
      <StudentLoginForm />
      <div className="mt-8 rounded-lg border border-dashed border-border bg-muted/40 p-3 text-xs text-muted-foreground">
        <p className="font-medium text-foreground">Demo student · password “student”</p>
        <p className="mt-1">Student ID: DDU/1001/14</p>
      </div>
    </AuthSplit>
  );
}
