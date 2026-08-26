import "server-only";
import type { NotificationType, Role, Prisma } from "@prisma/client";
import { db } from "@/server/db";

/** Record an FSM transition in the central audit trail. */
export async function logTransition(
  tx: Prisma.TransactionClient | typeof db,
  args: {
    entityType: string;
    entityId: string;
    event: string;
    from: string;
    to: string;
    actorId?: string | null;
    note?: string | null;
    meta?: Prisma.InputJsonValue;
  },
) {
  await tx.stateTransition.create({
    data: {
      entityType: args.entityType,
      entityId: args.entityId,
      event: args.event,
      fromState: args.from,
      toState: args.to,
      actorId: args.actorId ?? null,
      note: args.note ?? null,
      meta: args.meta,
    },
  });
}

/** Fan a notification out to a whole role (e.g. "new lab order" → all lab techs). */
export async function notifyRole(
  tx: Prisma.TransactionClient | typeof db,
  role: Role,
  n: { type: NotificationType; title: string; body?: string; link?: string },
) {
  await tx.notification.create({
    data: { recipientRole: role, type: n.type, title: n.title, body: n.body, link: n.link },
  });
}

/** Notify a specific user. */
export async function notifyUser(
  tx: Prisma.TransactionClient | typeof db,
  userId: string,
  n: { type: NotificationType; title: string; body?: string; link?: string },
) {
  await tx.notification.create({
    data: { recipientId: userId, type: n.type, title: n.title, body: n.body, link: n.link },
  });
}

/** Write a general audit-log entry. Best-effort: a logging failure must never
 *  break the primary operation. If the actorId can't be resolved (e.g. a session
 *  that predates a DB reseed → FK violation), fall back to a system entry. */
export async function audit(
  actorId: string | null,
  action: string,
  entityType?: string,
  entityId?: string,
  meta?: Prisma.InputJsonValue,
) {
  try {
    await db.auditLog.create({ data: { actorId, action, entityType, entityId, meta } });
  } catch {
    try {
      await db.auditLog.create({ data: { actorId: null, action, entityType, entityId, meta } });
    } catch (err) {
      console.warn("[audit] failed to record", action, err);
    }
  }
}
