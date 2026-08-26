import "server-only";
import * as OTPAuth from "otpauth";
import bcrypt from "bcryptjs";
import QRCode from "qrcode";
import { randomBytes } from "node:crypto";

/**
 * Multi-factor helpers: TOTP (authenticator app) enrolment/verification and
 * one-time recovery codes. Kept framework-agnostic so both the profile actions
 * and the login `authorize` flow can use them.
 */

const ISSUER = "DDU Clinic";

function makeTotp(secretBase32: string, label: string): OTPAuth.TOTP {
  return new OTPAuth.TOTP({
    issuer: ISSUER,
    label,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(secretBase32),
  });
}

/** Fresh base32 TOTP secret to store against the user once confirmed. */
export function generateTotpSecret(): string {
  return new OTPAuth.Secret({ size: 20 }).base32;
}

/** otpauth:// URI encoding the secret, account and issuer (for the QR + manual entry). */
export function totpKeyUri(accountName: string, secret: string): string {
  return makeTotp(secret, accountName).toString();
}

/** Render an otpauth URI to a data-URL PNG for display. */
export async function totpQrDataUrl(uri: string): Promise<string> {
  return QRCode.toDataURL(uri, { margin: 1, width: 220 });
}

/** Verify a 6-digit code against a secret. Tolerates spaces/hyphens; ±1 step drift. */
export function verifyTotp(secret: string, token: string): boolean {
  const clean = token.replace(/[^0-9]/g, "");
  if (clean.length !== 6) return false;
  try {
    return makeTotp(secret, "account").validate({ token: clean, window: 1 }) !== null;
  } catch {
    return false;
  }
}

// ── Recovery codes ───────────────────────────────────────────────────────────

/** Human-friendly one-time code like "3f9a-8c1d-b072". */
function newRecoveryCode(): string {
  const hex = randomBytes(6).toString("hex"); // 12 hex chars
  return `${hex.slice(0, 4)}-${hex.slice(4, 8)}-${hex.slice(8, 12)}`;
}

/** Generate N plaintext recovery codes (show once) + their bcrypt hashes (store). */
export async function generateRecoveryCodes(
  count = 10,
): Promise<{ plaintext: string[]; hashes: string[] }> {
  const plaintext = Array.from({ length: count }, newRecoveryCode);
  const hashes = await Promise.all(plaintext.map((c) => bcrypt.hash(c, 10)));
  return { plaintext, hashes };
}

/** Normalise a user-entered recovery code for comparison. */
export function normalizeRecoveryCode(input: string): string {
  return input.trim().toLowerCase().replace(/\s+/g, "");
}

export { bcrypt as passwordHasher };
