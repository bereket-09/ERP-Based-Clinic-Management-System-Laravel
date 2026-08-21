import { requireStaff } from "@/server/session";
import { db } from "@/server/db";
import { AppShell } from "@/components/shell/app-shell";
import { enabledFeatureSet } from "@/server/services/settings";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const actor = await requireStaff();

  const features = [...(await enabledFeatureSet(actor.role))];

  const notifications = await db.notification.findMany({
    where: {
      readAt: null,
      OR: [
        { recipientId: actor.id },
        ...(actor.role ? [{ recipientRole: actor.role }] : []),
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  return (
    <AppShell
      user={{ name: actor.name, email: actor.email, role: actor.role }}
      notifications={notifications.map((n) => ({
        id: n.id,
        title: n.title,
        body: n.body,
        link: n.link,
        type: n.type,
        createdAt: n.createdAt.toISOString(),
      }))}
      unreadCount={notifications.length}
      features={features}
    >
      {children}
    </AppShell>
  );
}
