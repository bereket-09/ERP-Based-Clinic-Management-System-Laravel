import "server-only";
import { revalidatePath } from "next/cache";
import type { AllergySeverity, ProblemStatus } from "@prisma/client";
import { db } from "@/server/db";
import type { Actor } from "@/server/session";

export async function addAllergy(
  input: { patientId: string; substance: string; reaction?: string; severity: AllergySeverity },
  actor: Actor,
) {
  await db.allergy.create({ data: { ...input, notedById: actor.id } });
  revalidatePath(`/patients/${input.patientId}`);
}

export async function removeAllergy(id: string, patientId: string) {
  await db.allergy.delete({ where: { id } });
  revalidatePath(`/patients/${patientId}`);
}

export async function addProblem(
  input: { patientId: string; problem: string; icdCode?: string; onsetDate?: Date },
  actor: Actor,
) {
  await db.problemListItem.create({ data: { ...input, notedById: actor.id } });
  revalidatePath(`/patients/${input.patientId}`);
}

export async function setProblemStatus(id: string, status: ProblemStatus, patientId: string) {
  await db.problemListItem.update({ where: { id }, data: { status } });
  revalidatePath(`/patients/${patientId}`);
}

export async function addImmunization(
  input: { patientId: string; vaccine: string; dose?: string; givenAt?: Date; nextDueAt?: Date },
  actor: Actor,
) {
  await db.immunization.create({ data: { ...input, givenById: actor.id } });
  revalidatePath(`/patients/${input.patientId}`);
}
