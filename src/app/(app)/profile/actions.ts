"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { requireStaff } from "@/server/session";
import { db } from "@/server/db";
import {
  generateTotpSecret,
  totpKeyUri,
  totpQrDataUrl,
  verifyTotp,
  generateRecoveryCodes,
} from "@/server/services/mfa";
import {
  buildRegistrationOptions,
  verifyRegistration,
  type RegistrationResponseJSON,
} from "@/server/services/webauthn";

export type FormState = { ok?: boolean; error?: string; message?: string };

const CHALLENGE_COOKIE = "webauthn_reg_challenge";

// ── Account ──────────────────────────────────────────────────────────────────

const accountSchema = z.object({
  name: z.string().trim().min(2, "Name is too short.").max(80),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9_.-]{3,30}$/, "3–30 chars: letters, numbers, dot, dash, underscore.")
    .optional()
    .or(z.literal("")),
});

export async function updateAccount(_prev: FormState, formData: FormData): Promise<FormState> {
  const actor = await requireStaff();
  const parsed = accountSchema.safeParse({
    name: formData.get("name"),
    username: formData.get("username"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const username = parsed.data.username ? parsed.data.username : null;
  if (username) {
    const taken = await db.user.findFirst({ where: { username, NOT: { id: actor.id } }, select: { id: true } });
    if (taken) return { error: "That username is already taken." };
  }

  await db.user.update({ where: { id: actor.id }, data: { name: parsed.data.name, username } });
  revalidatePath("/profile");
  return { ok: true, message: "Profile updated." };
}

// ── Password ─────────────────────────────────────────────────────────────────

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password."),
    newPassword: z.string().min(8, "New password must be at least 8 characters."),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "New passwords don't match.",
    path: ["confirmPassword"],
  });

export async function changePassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const actor = await requireStaff();
  const parsed = passwordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const user = await db.user.findUnique({ where: { id: actor.id } });
  if (!user) return { error: "Account not found." };

  const ok = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!ok) return { error: "Your current password is incorrect." };

  if (await bcrypt.compare(parsed.data.newPassword, user.passwordHash))
    return { error: "Choose a password different from your current one." };

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 10);
  await db.user.update({ where: { id: actor.id }, data: { passwordHash } });
  return { ok: true, message: "Password changed." };
}

// ── TOTP (authenticator app) ─────────────────────────────────────────────────

/** Start enrolment: create a pending secret (mfa stays OFF until confirmed) + QR. */
export async function startTotpEnrollment(): Promise<{ secret: string; otpauth: string; qr: string }> {
  const actor = await requireStaff();
  const secret = generateTotpSecret();
  await db.user.update({ where: { id: actor.id }, data: { totpSecret: secret, mfaEnabled: false } });
  const otpauth = totpKeyUri(actor.email ?? actor.name, secret);
  const qr = await totpQrDataUrl(otpauth);
  return { secret, otpauth, qr };
}

/** Confirm enrolment with a code → enable MFA and issue fresh recovery codes. */
export async function confirmTotpEnrollment(
  _prev: FormState & { codes?: string[] },
  formData: FormData,
): Promise<FormState & { codes?: string[] }> {
  const actor = await requireStaff();
  const code = String(formData.get("code") ?? "");
  const user = await db.user.findUnique({ where: { id: actor.id } });
  if (!user?.totpSecret) return { error: "Start enrolment first." };
  if (!verifyTotp(user.totpSecret, code)) return { error: "That code didn't match. Try again." };

  const { plaintext, hashes } = await generateRecoveryCodes(10);
  await db.$transaction([
    db.user.update({ where: { id: actor.id }, data: { mfaEnabled: true, mfaEnrolledAt: new Date() } }),
    db.recoveryCode.deleteMany({ where: { userId: actor.id } }),
    db.recoveryCode.createMany({ data: hashes.map((codeHash) => ({ userId: actor.id, codeHash })) }),
  ]);
  revalidatePath("/profile");
  return { ok: true, message: "Two-factor authentication is on.", codes: plaintext };
}

export async function disableMfa(_prev: FormState, formData: FormData): Promise<FormState> {
  const actor = await requireStaff();
  const password = String(formData.get("password") ?? "");
  const user = await db.user.findUnique({ where: { id: actor.id } });
  if (!user) return { error: "Account not found." };
  if (!(await bcrypt.compare(password, user.passwordHash)))
    return { error: "Password incorrect — MFA was not disabled." };

  await db.$transaction([
    db.user.update({ where: { id: actor.id }, data: { mfaEnabled: false, totpSecret: null, mfaEnrolledAt: null } }),
    db.recoveryCode.deleteMany({ where: { userId: actor.id } }),
  ]);
  revalidatePath("/profile");
  return { ok: true, message: "Two-factor authentication disabled." };
}

export async function regenerateRecoveryCodes(): Promise<{ codes: string[] } | { error: string }> {
  const actor = await requireStaff();
  const user = await db.user.findUnique({ where: { id: actor.id }, select: { mfaEnabled: true } });
  if (!user?.mfaEnabled) return { error: "Enable two-factor authentication first." };
  const { plaintext, hashes } = await generateRecoveryCodes(10);
  await db.$transaction([
    db.recoveryCode.deleteMany({ where: { userId: actor.id } }),
    db.recoveryCode.createMany({ data: hashes.map((codeHash) => ({ userId: actor.id, codeHash })) }),
  ]);
  return { codes: plaintext };
}

// ── Passkeys (WebAuthn) ──────────────────────────────────────────────────────

export async function startPasskeyRegistration() {
  const actor = await requireStaff();
  const existing = await db.authenticator.findMany({ where: { userId: actor.id } });
  const options = await buildRegistrationOptions({
    userId: actor.id,
    userName: actor.email ?? actor.name,
    displayName: actor.name,
    existing,
  });
  const jar = await cookies();
  jar.set(CHALLENGE_COOKIE, options.challenge, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 300,
  });
  return options;
}

export async function finishPasskeyRegistration(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const actor = await requireStaff();
  const jar = await cookies();
  const challenge = jar.get(CHALLENGE_COOKIE)?.value;
  if (!challenge) return { error: "Registration expired — please try again." };

  let response: RegistrationResponseJSON;
  try {
    response = JSON.parse(String(formData.get("response") ?? "")) as RegistrationResponseJSON;
  } catch {
    return { error: "Malformed passkey response." };
  }

  const verified = await verifyRegistration(response, challenge).catch(() => null);
  jar.delete(CHALLENGE_COOKIE);
  if (!verified) return { error: "Could not verify the passkey." };

  const label = String(formData.get("label") ?? "").trim() || "Passkey";
  await db.authenticator.create({
    data: {
      userId: actor.id,
      credentialId: verified.credentialId,
      publicKey: verified.publicKey,
      counter: verified.counter,
      transports: verified.transports,
      deviceType: verified.deviceType,
      backedUp: verified.backedUp,
      label,
    },
  });
  revalidatePath("/profile");
  return { ok: true, message: "Passkey added." };
}

export async function renamePasskey(id: string, label: string): Promise<FormState> {
  const actor = await requireStaff();
  const clean = label.trim().slice(0, 60) || "Passkey";
  const res = await db.authenticator.updateMany({ where: { id, userId: actor.id }, data: { label: clean } });
  if (res.count === 0) return { error: "Passkey not found." };
  revalidatePath("/profile");
  return { ok: true };
}

export async function deletePasskey(id: string): Promise<FormState> {
  const actor = await requireStaff();
  await db.authenticator.deleteMany({ where: { id, userId: actor.id } });
  revalidatePath("/profile");
  return { ok: true };
}
