"use server";
import { z } from "zod";
import { requireRole } from "@/server/session";
import { setLeaveBalance } from "@/server/services/hr-ops";

export type BalanceActionState = { error?: string; ok?: boolean };

const schema = z.object({
  userId: z.string().min(1),
  type: z.enum(["SICK", "ANNUAL", "MATERNITY", "PATERNITY", "UNPAID", "BEREAVEMENT", "STUDY"]),
  year: z.coerce.number().int().min(2000).max(2100),
  entitled: z.coerce.number().int().min(0).max(365),
});

export async function setLeaveBalanceAction(
  _prev: BalanceActionState,
  formData: FormData,
): Promise<BalanceActionState> {
  const actor = await requireRole("HR", "MANAGER");

  const parsed = schema.safeParse({
    userId: formData.get("userId"),
    type: formData.get("type"),
    year: formData.get("year"),
    entitled: formData.get("entitled"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid request." };
  }

  try {
    await setLeaveBalance(parsed.data, actor);
    return { ok: true };
  } catch {
    return { error: "Could not update the leave balance." };
  }
}
