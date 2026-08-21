import "server-only";
import { revalidatePath } from "next/cache";
import type { Gender } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { db } from "@/server/db";
import type { Actor } from "@/server/session";
import { makeCode } from "./ids";
import { logTransition } from "./events";
import { transitionVisit } from "./visit";

export interface RegisterPatientInput {
  studentId?: string;
  name: string;
  gender?: Gender;
  birthday?: Date;
  phone?: string;
  email?: string;
  college?: string;
  program?: string;
  yearOfStudy?: string;
  block?: string;
  dorm?: string;
  bloodType?: string;
  region?: string;
  nationality?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  fromSims?: boolean;
}

/** Search patients by name / MRN / student ID. */
export async function findPatients(q: string | undefined, take = 30) {
  const where: Prisma.PatientWhereInput = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { mrn: { contains: q, mode: "insensitive" } },
          { studentId: { contains: q, mode: "insensitive" } },
          { phone: { contains: q } },
        ],
      }
    : {};
  return db.patient.findMany({
    where,
    include: { visits: { orderBy: { openedAt: "desc" }, take: 1 } },
    orderBy: { createdAt: "desc" },
    take,
  });
}

export async function registerPatient(input: RegisterPatientInput) {
  const data = {
    type: "STUDENT" as const,
    source: (input.fromSims ? "SIMS" : "MANUAL") as "SIMS" | "MANUAL",
    studentId: input.studentId?.trim() || null,
    name: input.name,
    gender: input.gender,
    birthday: input.birthday,
    phone: input.phone,
    email: input.email,
    college: input.college,
    program: input.program,
    yearOfStudy: input.yearOfStudy,
    block: input.block,
    dorm: input.dorm,
    bloodType: input.bloodType,
    region: input.region,
    nationality: input.nationality ?? "Ethiopian",
    emergencyContactName: input.emergencyContactName,
    emergencyContactPhone: input.emergencyContactPhone,
  };

  // Concurrency-safe MRN allocation: derive a starting number, then retry the
  // next number on the rare unique collision when two desks register at once.
  const base = (await db.patient.count()) + 1001;
  for (let i = 0; i < 25; i++) {
    try {
      const patient = await db.patient.create({ data: { ...data, mrn: `MRN-${base + i}` } });
      revalidatePath("/patients");
      return patient;
    } catch (e) {
      // Only retry when the clash is specifically on the MRN; rethrow otherwise
      // (e.g. a duplicate studentId, which reception pre-checks).
      const isMrnClash =
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2002" &&
        String((e.meta as { target?: string[] } | undefined)?.target ?? "").includes("mrn");
      if (!isMrnClash) throw e;
    }
  }
  throw new Error("Could not allocate a unique MRN — please retry.");
}

/**
 * Open a visit for a patient and queue it to a doctor. Creates the visit in
 * REGISTERED, then drives it through the FSM `send_to_doctor` transition.
 */
export async function createVisitAndQueue(
  patientId: string,
  data: { chiefComplaint?: string; priority?: "ROUTINE" | "URGENT" | "EMERGENCY"; doctorId?: string; withTriage?: boolean },
  actor: Actor,
) {
  const seq = (await db.visit.count()) + 1;
  const visit = await db.visit.create({
    data: {
      visitNo: makeCode("V", seq),
      state: "REGISTERED",
      priority: data.priority ?? "ROUTINE",
      patientId,
      createdById: actor.id,
      doctorId: data.doctorId,
      chiefComplaint: data.chiefComplaint,
    },
  });
  await logTransition(db, {
    entityType: "Visit",
    entityId: visit.id,
    event: "create",
    from: "-",
    to: "REGISTERED",
    actorId: actor.id,
  });

  if (data.withTriage) {
    await transitionVisit(visit.id, "start_triage", actor, {});
  } else {
    await transitionVisit(visit.id, "send_to_doctor", actor, { doctorId: data.doctorId });
  }
  revalidatePath("/patients");
  revalidatePath("/doctor");
  revalidatePath("/reception");
  return visit;
}

export async function getPatientDetail(id: string) {
  return db.patient.findUnique({
    where: { id },
    include: {
      department: true,
      visits: {
        orderBy: { openedAt: "desc" },
        include: {
          doctor: true,
          labOrders: { include: { items: { include: { test: true } } } },
          drugOrders: { include: { items: { include: { medication: true } } } },
        },
      },
      issuedDocuments: { orderBy: { issuedAt: "desc" } },
      referrals: { orderBy: { createdAt: "desc" } },
      allergies: { orderBy: { createdAt: "desc" } },
      problems: { orderBy: [{ status: "asc" }, { createdAt: "desc" }] },
      immunizations: { orderBy: { givenAt: "desc" } },
    },
  });
}
