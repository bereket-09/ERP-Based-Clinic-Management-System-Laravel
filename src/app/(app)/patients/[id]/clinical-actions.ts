"use server";
import { z } from "zod";
import { requireStaff } from "@/server/session";
import { addAllergy, addProblem, addImmunization, setProblemStatus } from "@/server/services/clinical";

export interface Result {
  ok: boolean;
  error?: string;
}

const allergySchema = z.object({
  patientId: z.string(),
  substance: z.string().trim().min(1),
  reaction: z.string().trim().optional(),
  severity: z.enum(["MILD", "MODERATE", "SEVERE"]),
});

export async function addAllergyAction(input: z.input<typeof allergySchema>): Promise<Result> {
  const actor = await requireStaff();
  const p = allergySchema.safeParse(input);
  if (!p.success) return { ok: false, error: "Substance is required" };
  await addAllergy(p.data, actor);
  return { ok: true };
}

const problemSchema = z.object({
  patientId: z.string(),
  problem: z.string().trim().min(1),
  icdCode: z.string().trim().optional(),
});

export async function addProblemAction(input: z.input<typeof problemSchema>): Promise<Result> {
  const actor = await requireStaff();
  const p = problemSchema.safeParse(input);
  if (!p.success) return { ok: false, error: "Problem is required" };
  await addProblem(p.data, actor);
  return { ok: true };
}

export async function resolveProblemAction(id: string, patientId: string): Promise<Result> {
  await requireStaff();
  await setProblemStatus(id, "RESOLVED", patientId);
  return { ok: true };
}

const immunizationSchema = z.object({
  patientId: z.string(),
  vaccine: z.string().trim().min(1),
  dose: z.string().trim().optional(),
});

export async function addImmunizationAction(input: z.input<typeof immunizationSchema>): Promise<Result> {
  const actor = await requireStaff();
  const p = immunizationSchema.safeParse(input);
  if (!p.success) return { ok: false, error: "Vaccine is required" };
  await addImmunization(p.data, actor);
  return { ok: true };
}
