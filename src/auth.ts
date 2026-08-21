import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/server/db";
import { authConfig } from "@/auth.config";

/** Thrown when a staffer is on approved leave (or otherwise blocked) — surfaces
 *  as ?error=blocked on the login page so we can explain instead of a generic fail. */
class BlockedSignin extends CredentialsSignin {
  code = "blocked";
}

const staffSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const studentSchema = z.object({
  studentId: z.string().min(1),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      id: "staff",
      name: "Staff",
      credentials: { email: {}, password: {} },
      async authorize(raw) {
        const parsed = staffSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        const user = await db.user.findUnique({ where: { email: email.toLowerCase() } });
        if (!user || !user.isActive) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        // On-leave / suspended / terminated staff cannot sign in.
        if (user.employmentStatus !== "ACTIVE") {
          throw new BlockedSignin();
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          kind: "staff" as const,
        };
      },
    }),
    Credentials({
      id: "student",
      name: "Student",
      credentials: { studentId: {}, password: {} },
      async authorize(raw) {
        const parsed = studentSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { studentId, password } = parsed.data;

        const patient = await db.patient.findUnique({
          where: { studentId: studentId.trim() },
        });
        if (!patient || !patient.portalEnabled || !patient.portalPasswordHash) return null;

        const ok = await bcrypt.compare(password, patient.portalPasswordHash);
        if (!ok) return null;

        return {
          id: patient.id,
          name: patient.name,
          email: patient.email ?? undefined,
          role: null,
          kind: "student" as const,
        };
      },
    }),
  ],
});
