import "server-only";
import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";
import { auth } from "@/auth";

export interface Actor {
  id: string;
  name: string;
  email?: string | null;
  kind: "staff" | "student";
  role: Role | null;
}

/** Current actor or null (no redirect). */
export async function getActor(): Promise<Actor | null> {
  const session = await auth();
  if (!session?.user) return null;
  const u = session.user;
  return {
    id: u.id,
    name: u.name ?? "",
    email: u.email,
    kind: u.kind,
    role: u.role ?? null,
  };
}

/** Require a signed-in staff member, else redirect to login. */
export async function requireStaff(): Promise<Actor> {
  const actor = await getActor();
  if (!actor || actor.kind !== "staff") redirect("/login");
  return actor;
}

/** Require a signed-in student (portal), else redirect. */
export async function requireStudent(): Promise<Actor> {
  const actor = await getActor();
  if (!actor || actor.kind !== "student") redirect("/student-login");
  return actor;
}

/** Require one of the given roles (managers always pass). */
export async function requireRole(...roles: Role[]): Promise<Actor> {
  const actor = await requireStaff();
  if (actor.role === "MANAGER") return actor;
  if (!actor.role || !roles.includes(actor.role)) redirect("/dashboard");
  return actor;
}
