"use server";
import { requireStaff } from "@/server/session";
import { markAllRead, markRead } from "@/server/services/notifications";

export async function markReadAction(id: string): Promise<{ ok: boolean }> {
  const actor = await requireStaff();
  await markRead(id, actor);
  return { ok: true };
}

export async function markAllReadAction(): Promise<{ ok: boolean }> {
  const actor = await requireStaff();
  await markAllRead(actor);
  return { ok: true };
}
