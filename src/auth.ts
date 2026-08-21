import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/server/db";
import { authConfig } from "@/auth.config";
import { verifyTotp } from "@/server/services/mfa";

/** Thrown when a staffer is on approved leave (or otherwise blocked) — surfaces
 *  as ?error=blocked on the login page so we can explain instead of a generic fail. */
class BlockedSignin extends CredentialsSignin {
  code = "blocked";
}

/** Password was correct but the account has MFA on and no/invalid code was given. */
class MfaRequiredSignin extends CredentialsSignin {
  code = "mfa_required";
}
class MfaInvalidSignin extends CredentialsSignin {
  code = "mfa_invalid";
}

/** Verify a TOTP code, falling back to consuming a one-time recovery code. */
async function passesSecondFactor(
  user: { id: string; totpSecret: string | null },
  token: string | undefined,
): Promise<boolean> {
  const code = (token ?? "").trim();
  if (!code) return false;
  if (user.totpSecret && verifyTotp(user.totpSecret, code)) return true;

  // Recovery code path (only if it doesn't look like a plain 6-digit TOTP).
  const normalized = code.toLowerCase().replace(/\s+/g, "");
  const candidates = await db.recoveryCode.findMany({ where: { userId: user.id, usedAt: null } });
  for (const rc of candidates) {
    if (await bcrypt.compare(normalized, rc.codeHash)) {
      await db.recoveryCode.update({ where: { id: rc.id }, data: { usedAt: new Date() } });
      return true;
    }
  }
  return false;
}

const staffSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  token: z.string().optional(),
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
      credentials: { email: {}, password: {}, token: {} },
      async authorize(raw) {
        const parsed = staffSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password, token } = parsed.data;

        const user = await db.user.findUnique({ where: { email: email.toLowerCase() } });
        if (!user || !user.isActive) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        // On-leave / suspended / terminated staff cannot sign in.
        if (user.employmentStatus !== "ACTIVE") {
          throw new BlockedSignin();
        }

        // Second factor (authenticator app or recovery code) when enabled.
        if (user.mfaEnabled) {
          if (!token) throw new MfaRequiredSignin();
          if (!(await passesSecondFactor(user, token))) throw new MfaInvalidSignin();
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
