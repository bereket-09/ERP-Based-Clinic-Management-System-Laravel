"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireRole } from "@/server/session";
import { issueSickLeave } from "@/server/services/documents";

export interface IssueSickLeaveState {
  error?: string;
}

const schema = z
  .object({
    visitId: z.string().min(1, "Missing visit"),
    fromDate: z.string().min(1, "Start date is required"),
    toDate: z.string().min(1, "End date is required"),
    recommendation: z.string().trim().optional(),
    diagnosis: z.string().trim().optional(),
  })
  .refine((v) => !Number.isNaN(Date.parse(v.fromDate)) && !Number.isNaN(Date.parse(v.toDate)), {
    message: "Enter valid dates",
    path: ["toDate"],
  })
  .refine((v) => new Date(v.toDate) >= new Date(v.fromDate), {
    message: "End date must be on or after the start date",
    path: ["toDate"],
  });

/** Whole days inclusive of both endpoints. */
function inclusiveDays(from: Date, to: Date): number {
  const ms = to.setHours(0, 0, 0, 0) - new Date(from).setHours(0, 0, 0, 0);
  return Math.floor(ms / 86_400_000) + 1;
}

export async function issueSickLeaveAction(
  _prev: IssueSickLeaveState,
  formData: FormData,
): Promise<IssueSickLeaveState> {
  const actor = await requireRole("DOCTOR");

  const parsed = schema.safeParse({
    visitId: formData.get("visitId"),
    fromDate: formData.get("fromDate"),
    toDate: formData.get("toDate"),
    recommendation: formData.get("recommendation"),
    diagnosis: formData.get("diagnosis"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { visitId, fromDate, toDate, recommendation, diagnosis } = parsed.data;
  const from = new Date(fromDate);
  const to = new Date(toDate);
  const days = inclusiveDays(from, to);

  let docId: string;
  try {
    const doc = await issueSickLeave(
      visitId,
      {
        fromDate: from,
        toDate: to,
        days,
        recommendation: recommendation || undefined,
        diagnosis: diagnosis || undefined,
      },
      actor,
    );
    docId = doc.id;
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not issue certificate" };
  }

  redirect(`/print/sick-leave/${docId}`);
}
