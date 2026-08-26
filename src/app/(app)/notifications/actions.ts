"use server";
import { requireStaff } from "@/server/session";
import { markAllRead, markRead, listNotifications, unreadCount } from "@/server/services/notifications";

export interface NotificationSnapshot {
  unreadCount: number;
  items: { id: string; title: string; body: string | null; link: string | null; type: string; createdAt: string }[];
}

/** Live snapshot for the header bell — polled from the client so new events
 *  appear without a full page reload. */
export async function notificationSnapshot(): Promise<NotificationSnapshot> {
  const actor = await requireStaff();
  const [count, rows] = await Promise.all([
    unreadCount(actor),
    listNotifications(actor, { unreadOnly: true }),
  ]);
  return {
    unreadCount: count,
    items: rows.slice(0, 8).map((n) => ({
      id: n.id,
      title: n.title,
      body: n.body,
      link: n.link,
      type: n.type,
      createdAt: n.createdAt.toISOString(),
    })),
  };
}

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
