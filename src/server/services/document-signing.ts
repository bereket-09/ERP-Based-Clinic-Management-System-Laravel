import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type { IssuedDocument, Referral } from "@prisma/client";
import { db } from "@/server/db";

/**
 * Tamper-evident document signing. Every issued document carries a short public
 * verifyCode (printed as text + QR) and an HMAC-SHA256 signature over its
 * immutable facts. Anyone can open /verify/<code>; the server recomputes the
 * HMAC from the stored record and confirms it matches — so a photoshopped
 * certificate won't verify, and a real one always will.
 */

function secret(): string {
  return (
    process.env.DOCUMENT_SIGNING_SECRET ??
    process.env.AUTH_SECRET ??
    "ddu-clinic-dev-doc-secret"
  );
}

// Crockford base32 without ambiguous chars (no I, L, O, U).
const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

export function newVerifyCode(len = 10): string {
  const bytes = randomBytes(len);
  let out = "";
  for (let i = 0; i < len; i++) out += ALPHABET[bytes[i] % ALPHABET.length];
  return out;
}

/** Human-friendly grouping for display: ABCDE-FGHIJ. */
export function formatVerifyCode(code: string): string {
  const c = code.toUpperCase().replace(/[^0-9A-Z]/g, "");
  return c.length > 5 ? `${c.slice(0, 5)}-${c.slice(5)}` : c;
}

export function normalizeVerifyCode(input: string): string {
  return input.toUpperCase().replace(/[^0-9A-Z]/g, "");
}

/** Deterministic canonical string over the document's immutable facts. */
function canonical(doc: {
  docNo: string;
  type: string;
  patientId: string | null;
  visitId: string | null;
  fromDate: Date | null;
  toDate: Date | null;
  days: number | null;
  issuedById: string | null;
  issuedAt: Date;
}): string {
  return [
    doc.docNo,
    doc.type,
    doc.patientId ?? "",
    doc.visitId ?? "",
    doc.fromDate?.toISOString() ?? "",
    doc.toDate?.toISOString() ?? "",
    doc.days ?? "",
    doc.issuedById ?? "",
    doc.issuedAt.toISOString(),
  ].join("|");
}

export function computeSignature(doc: Parameters<typeof canonical>[0]): string {
  return createHmac("sha256", secret()).update(canonical(doc)).digest("hex");
}

/** Generate + persist a verifyCode and signature for a freshly-created document. */
export async function signIssuedDocument(doc: IssuedDocument): Promise<{ verifyCode: string; signature: string }> {
  const signature = computeSignature(doc);
  // Retry a couple of times in the astronomically-unlikely event of a code clash.
  for (let attempt = 0; attempt < 5; attempt++) {
    const verifyCode = newVerifyCode();
    try {
      await db.issuedDocument.update({ where: { id: doc.id }, data: { verifyCode, signature } });
      return { verifyCode, signature };
    } catch {
      // unique collision — try another code
    }
  }
  throw new Error("Could not allocate a unique verify code");
}

// ── Referrals (signed lazily on first print) ─────────────────────────────────

function referralCanonical(r: {
  referralNo: string;
  patientId: string;
  visitId: string | null;
  toFacility: string;
  referredById: string | null;
  createdAt: Date;
}): string {
  return ["REFERRAL", r.referralNo, r.patientId, r.visitId ?? "", r.toFacility, r.referredById ?? "", r.createdAt.toISOString()].join("|");
}

function computeReferralSignature(r: Parameters<typeof referralCanonical>[0]): string {
  return createHmac("sha256", secret()).update(referralCanonical(r)).digest("hex");
}

/** Ensure a referral has a verifyCode + signature; generate/persist on first use. */
export async function ensureReferralSignature(r: Referral): Promise<{ verifyCode: string; signature: string }> {
  const signature = computeReferralSignature(r);
  if (r.verifyCode && r.signature === signature) {
    return { verifyCode: r.verifyCode, signature };
  }
  for (let attempt = 0; attempt < 5; attempt++) {
    const verifyCode = r.verifyCode ?? newVerifyCode();
    try {
      await db.referral.update({ where: { id: r.id }, data: { verifyCode, signature } });
      return { verifyCode, signature };
    } catch {
      if (r.verifyCode) throw new Error("Could not persist referral signature");
      // else retry with a new code on unique clash
    }
  }
  throw new Error("Could not allocate a unique verify code");
}

// ── Unified public verification ──────────────────────────────────────────────

export interface VerifiedRecord {
  kind: "document" | "referral";
  docNo: string;
  type: string;
  patientName?: string | null;
  patientMrn?: string | null;
  fromDate?: Date | null;
  toDate?: Date | null;
  days?: number | null;
  issuedByName?: string | null;
  issuedAt: Date;
  verifyCode: string;
}

export type VerificationResult =
  | { status: "not_found" }
  | { status: "revoked"; record: VerifiedRecord }
  | { status: "invalid"; record: VerifiedRecord }
  | { status: "valid"; record: VerifiedRecord };

function safeEqual(expected: string, actual: string | null): boolean {
  const a = Buffer.from(expected);
  const b = Buffer.from(actual ?? "");
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Public verification: look up by code (document or referral) and recompute the HMAC. */
export async function verifyByCode(rawCode: string): Promise<VerificationResult> {
  const verifyCode = normalizeVerifyCode(rawCode);
  if (!verifyCode) return { status: "not_found" };

  const doc = await db.issuedDocument.findUnique({
    where: { verifyCode },
    include: { patient: true, issuedBy: { select: { name: true, title: true } } },
  });
  if (doc) {
    const record: VerifiedRecord = {
      kind: "document",
      docNo: doc.docNo,
      type: doc.type,
      patientName: doc.patient?.name ?? null,
      patientMrn: doc.patient?.mrn ?? null,
      fromDate: doc.fromDate,
      toDate: doc.toDate,
      days: doc.days,
      issuedByName: doc.issuedBy ? `${doc.issuedBy.title ? doc.issuedBy.title + " " : ""}${doc.issuedBy.name}` : null,
      issuedAt: doc.issuedAt,
      verifyCode,
    };
    if (doc.revokedAt) return { status: "revoked", record };
    return safeEqual(computeSignature(doc), doc.signature) ? { status: "valid", record } : { status: "invalid", record };
  }

  const ref = await db.referral.findUnique({
    where: { verifyCode },
    include: { patient: true, referredBy: { select: { name: true, title: true } } },
  });
  if (ref) {
    const record: VerifiedRecord = {
      kind: "referral",
      docNo: ref.referralNo,
      type: "REFERRAL",
      patientName: ref.patient?.name ?? null,
      patientMrn: ref.patient?.mrn ?? null,
      issuedByName: ref.referredBy ? `${ref.referredBy.title ? ref.referredBy.title + " " : ""}${ref.referredBy.name}` : null,
      issuedAt: ref.issuedAt ?? ref.createdAt,
      verifyCode,
    };
    if (ref.state === "CANCELLED") return { status: "revoked", record };
    return safeEqual(computeReferralSignature(ref), ref.signature) ? { status: "valid", record } : { status: "invalid", record };
  }

  return { status: "not_found" };
}
