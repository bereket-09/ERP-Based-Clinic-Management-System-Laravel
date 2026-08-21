"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { Gender } from "@prisma/client";
import { db } from "@/server/db";
import { requireRole } from "@/server/session";
import { getSimsProvider, type SimsStudent } from "@/server/integrations/sims";
import { registerPatient, createVisitAndQueue } from "@/server/services/patient";

export interface LookupState {
  error?: string;
  studentId?: string;
  existing?: { id: string; name: string; mrn: string; studentId: string | null };
  sims?: SimsStudent;
  notFound?: boolean;
}

export async function lookupStudent(_prev: LookupState, formData: FormData): Promise<LookupState> {
  await requireRole("RECEPTIONIST");
  const sid = String(formData.get("studentId") ?? "").trim();
  if (!sid) return { error: "Enter a student ID or name." };

  const existing = await db.patient.findFirst({
    where: { OR: [{ studentId: sid }, { mrn: sid }, { name: { equals: sid, mode: "insensitive" } }] },
  });
  if (existing) {
    return { studentId: sid, existing: { id: existing.id, name: existing.name, mrn: existing.mrn, studentId: existing.studentId } };
  }

  const sims = await getSimsProvider().lookup(sid);
  return { studentId: sid, sims: sims ?? undefined, notFound: !sims };
}

const registerSchema = z.object({
  studentId: z.string().trim().optional(),
  name: z.string().trim().min(2, "Name is required"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  phone: z.string().trim().optional(),
  college: z.string().trim().optional(),
  program: z.string().trim().optional(),
  yearOfStudy: z.string().trim().optional(),
  bloodType: z.string().trim().optional(),
  emergencyContactName: z.string().trim().optional(),
  emergencyContactPhone: z.string().trim().optional(),
  fromSims: z.coerce.boolean().optional(),
  chiefComplaint: z.string().trim().optional(),
  priority: z.enum(["ROUTINE", "URGENT", "EMERGENCY"]).optional(),
  doctorId: z.string().trim().optional(),
});

export interface RegisterState {
  error?: string;
  /** Set when a matching record already exists — surfaced so the desk can open it instead of creating a duplicate. */
  duplicate?: { id: string; name: string; mrn: string; studentId: string | null };
}

export async function registerAndVisit(_prev: RegisterState, formData: FormData): Promise<RegisterState> {
  const actor = await requireRole("RECEPTIONIST");
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid data" };
  const d = parsed.data;

  // Dedupe guard: never create a second card for a student who is already on file.
  // studentId + mrn are unique in the schema, so this also prevents a hard 500 on
  // concurrent registrations from two reception desks.
  if (d.studentId) {
    const existing = await db.patient.findUnique({ where: { studentId: d.studentId } });
    if (existing) {
      return {
        duplicate: { id: existing.id, name: existing.name, mrn: existing.mrn, studentId: existing.studentId },
      };
    }
  }

  let patient: Awaited<ReturnType<typeof registerPatient>>;
  try {
    patient = await registerPatient({
      studentId: d.studentId || undefined,
      name: d.name,
      gender: d.gender as Gender | undefined,
      phone: d.phone,
      college: d.college,
      program: d.program,
      yearOfStudy: d.yearOfStudy,
      bloodType: d.bloodType,
      emergencyContactName: d.emergencyContactName,
      emergencyContactPhone: d.emergencyContactPhone,
      fromSims: d.fromSims,
    });
  } catch (err) {
    // Unique-constraint race (studentId/mrn taken between the check and the insert).
    if (typeof err === "object" && err !== null && (err as { code?: string }).code === "P2002" && d.studentId) {
      const existing = await db.patient.findUnique({ where: { studentId: d.studentId } });
      if (existing) {
        return {
          duplicate: { id: existing.id, name: existing.name, mrn: existing.mrn, studentId: existing.studentId },
        };
      }
    }
    return { error: "Could not register patient. Please try again." };
  }

  await createVisitAndQueue(
    patient.id,
    { chiefComplaint: d.chiefComplaint, priority: d.priority, doctorId: d.doctorId || undefined },
    actor,
  );
  redirect(`/patients/${patient.id}`);
}

const visitSchema = z.object({
  patientId: z.string(),
  chiefComplaint: z.string().trim().optional(),
  priority: z.enum(["ROUTINE", "URGENT", "EMERGENCY"]).optional(),
  doctorId: z.string().trim().optional(),
});

export async function startVisitForExisting(_prev: RegisterState, formData: FormData): Promise<RegisterState> {
  const actor = await requireRole("RECEPTIONIST");
  const parsed = visitSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Invalid data" };
  const d = parsed.data;
  await createVisitAndQueue(
    d.patientId,
    { chiefComplaint: d.chiefComplaint, priority: d.priority, doctorId: d.doctorId || undefined },
    actor,
  );
  redirect(`/patients/${d.patientId}`);
}
