import { Bell } from "lucide-react";
import { requireStaff } from "@/server/session";
import { listNotifications, unreadCount } from "@/server/services/notifications";
import { PageHeader } from "@/components/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MarkAllReadButton,
  NotificationList,
  type NotificationRow,
} from "./notifications-client";

export const metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const actor = await requireStaff();
  const [notifications, unread] = await Promise.all([
    listNotifications(actor),
    unreadCount(actor),
  ]);

  const rows: NotificationRow[] = notifications.map((n) => ({
    id: n.id,
    type: n.type,
    title: n.title,
    body: n.body,
    link: n.link,
    read: n.readAt !== null,
    createdAt: n.createdAt.toISOString(),
  }));
  const unreadRows = rows.filter((n) => !n.read);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Bell}
        title="Notifications"
        description={
          unread > 0
            ? `You have ${unread} unread notification${unread === 1 ? "" : "s"}.`
            : "You’re all caught up."
        }
        actions={<MarkAllReadButton unreadCount={unread} />}
      />

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All ({rows.length})</TabsTrigger>
          <TabsTrigger value="unread">Unread ({unread})</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <NotificationList notifications={rows} />
        </TabsContent>
        <TabsContent value="unread">
          <NotificationList notifications={unreadRows} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
