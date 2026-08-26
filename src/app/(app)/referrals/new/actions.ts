"use server";
import { redirect } from "next/navigation";
import type { ReferralUrgency } from "@prisma/client";
import { requireRole } from "@/server/session";
import { createReferral } from "@/server/services/referral";

export interface NewReferralState {
  error?: string;
}

const URGENCIES: ReferralUrgency[] = ["ROUTINE", "URGENT", "EMERGENCY"];

export async function createReferralAction(
  _prev: NewReferralState,
  formData: FormData,
): Promise<NewReferralState> {
  const actor = await requireRole("DOCTOR", "RECEPTIONIST");

  const patientId = String(formData.get("patientId") ?? "").trim();
  const toFacility = String(formData.get("toFacility") ?? "").trim();
  const toDepartment = String(formData.get("toDepartment") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();
  const clinicalSummary = String(formData.get("clinicalSummary") ?? "").trim();
  const urgencyRaw = String(formData.get("urgency") ?? "ROUTINE");
  const urgency = (URGENCIES.includes(urgencyRaw as ReferralUrgency)
    ? urgencyRaw
    : "ROUTINE") as ReferralUrgency;

  if (!patientId) return { error: "Select a patient" };
  if (!toFacility) return { error: "Destination facility is required" };
  if (!reason) return { error: "A reason for referral is required" };

  let id: string;
  try {
    const referral = await createReferral(
      {
        patientId,
        toFacility,
        toDepartment: toDepartment || undefined,
        reason,
        clinicalSummary: clinicalSummary || undefined,
        urgency,
      },
      actor,
    );
    id = referral.id;
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not create referral" };
  }

  redirect(`/referrals/${id}`);
}
