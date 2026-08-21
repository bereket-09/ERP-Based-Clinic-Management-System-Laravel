import "server-only";
import { revalidatePath } from "next/cache";
import type { DocumentType, Prisma } from "@prisma/client";
import { db } from "@/server/db";
import type { Actor } from "@/server/session";
import { makeCode } from "./ids";
import { audit } from "./events";

// ─────────────────────────────────────────────────────────────────────────────
// Documents & printouts — issue and retrieve IssuedDocument records.
// ─────────────────────────────────────────────────────────────────────────────

/** Next document reference, e.g. DOC-2026-00042. */
async function nextDocNo(): Promise<string> {
  const seq = (await db.issuedDocument.count()) + 1;
  return makeCode("DOC", seq);
}

export interface SickLeaveInput {
  fromDate: Date;
  toDate: Date;
  days: number;
  recommendation?: string;
  diagnosis?: string;
}

/**
 * Issue a SICK_LEAVE certificate for a visit. Links to the visit + its patient,
 * stores an immutable payload snapshot of what was printed, audits, and
 * revalidates. Returns the created document.
 */
export async function issueSickLeave(
  visitId: string,
  input: SickLeaveInput,
  actor: Actor,
) {
  const visit = await db.visit.findUnique({
    where: { id: visitId },
    include: { patient: true },
  });
  if (!visit) throw new Error("Visit not found");

  const docNo = await nextDocNo();

  const payload = {
    kind: "SICK_LEAVE",
    patient: {
      name: visit.patient.name,
      mrn: visit.patient.mrn,
      gender: visit.patient.gender,
      age: computeAge(visit.patient.birthday),
    },
    visitNo: visit.visitNo,
    diagnosis: input.diagnosis ?? visit.diagnosis ?? null,
    fromDate: input.fromDate.toISOString(),
    toDate: input.toDate.toISOString(),
    days: input.days,
    recommendation: input.recommendation ?? null,
    issuedByName: actor.name,
  } satisfies Prisma.InputJsonObject;

  const doc = await db.issuedDocument.create({
    data: {
      docNo,
      type: "SICK_LEAVE",
      visitId: visit.id,
      patientId: visit.patientId,
      issuedById: actor.id,
      fromDate: input.fromDate,
      toDate: input.toDate,
      days: input.days,
      recommendation: input.recommendation ?? null,
      payload,
    },
  });

  await audit(actor.id, "document.issue", "IssuedDocument", doc.id, {
    type: "SICK_LEAVE",
    docNo,
    visitId: visit.id,
  });

  revalidatePath(`/documents/${doc.id}`);
  revalidatePath(`/visits/${visit.id}`);
  return doc;
}

export interface IssueDocumentInput {
  visitId?: string;
  patientId?: string;
  payload?: Prisma.InputJsonValue;
  fromDate?: Date;
  toDate?: Date;
  days?: number;
  recommendation?: string;
}

/**
 * Generic issuer for the remaining document types (PRESCRIPTION, REFERRAL,
 * LAB_REPORT, ADMISSION_SUMMARY). Stores a payload snapshot, audits, and
 * revalidates. Returns the created document.
 */
export async function issueDocument(
  type: DocumentType,
  input: IssueDocumentInput,
  actor: Actor,
) {
  if (!input.visitId && !input.patientId) {
    throw new Error("A visit or patient is required to issue a document");
  }

  const docNo = await nextDocNo();

  const doc = await db.issuedDocument.create({
    data: {
      docNo,
      type,
      visitId: input.visitId,
      patientId: input.patientId,
      issuedById: actor.id,
      fromDate: input.fromDate,
      toDate: input.toDate,
      days: input.days,
      recommendation: input.recommendation,
      payload: input.payload,
    },
  });

  await audit(actor.id, "document.issue", "IssuedDocument", doc.id, {
    type,
    docNo,
  });

  revalidatePath(`/documents/${doc.id}`);
  return doc;
}

/** Load an issued document with its relations. */
export async function getDocument(id: string) {
  return db.issuedDocument.findUnique({
    where: { id },
    include: {
      patient: true,
      visit: true,
      issuedBy: { select: { id: true, name: true, title: true, speciality: true } },
    },
  });
}

/** Whole-year age from a birthday, or null. */
function computeAge(birthday: Date | null): number | null {
  if (!birthday) return null;
  const diff = Date.now() - birthday.getTime();
  return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
}
