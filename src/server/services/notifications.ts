import "server-only";
import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";
import { db } from "@/server/db";
import type { Actor } from "@/server/session";

/** Rows targeted at this actor: their own inbox OR broadcasts to their role. */
function recipientWhere(actor: Actor): Prisma.NotificationWhereInput {
  return {
    OR: [
      { recipientId: actor.id },
      ...(actor.role ? [{ recipientRole: actor.role }] : []),
    ],
  };
}

/** Notifications for the current actor, newest first. */
export function listNotifications(actor: Actor, opts?: { unreadOnly?: boolean }) {
  return db.notification.findMany({
    where: {
      ...recipientWhere(actor),
      ...(opts?.unreadOnly ? { readAt: null } : {}),
    },
    orderBy: { createdAt: "desc" },
  });
}

/** Count of unread notifications for the current actor. */
export function unreadCount(actor: Actor) {
  return db.notification.count({
    where: { ...recipientWhere(actor), readAt: null },
  });
}

/** Mark a single notification read (only if it targets this actor). */
export async function markRead(id: string, actor: Actor) {
  await db.notification.updateMany({
    where: { id, ...recipientWhere(actor), readAt: null },
    data: { readAt: new Date() },
  });
  revalidatePath("/", "layout");
  revalidatePath("/notifications");
}

/** Mark every unread notification for this actor as read. */
export async function markAllRead(actor: Actor) {
  await db.notification.updateMany({
    where: { ...recipientWhere(actor), readAt: null },
    data: { readAt: new Date() },
  });
  revalidatePath("/", "layout");
  revalidatePath("/notifications");
}
