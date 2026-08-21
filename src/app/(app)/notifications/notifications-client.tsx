"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import {
  Bell,
  CheckCheck,
  FlaskConical,
  FileText,
  Loader2,
  Pill,
  PackageCheck,
  Send,
  BedDouble,
  CalendarClock,
  ClipboardCheck,
  PackageX,
  type LucideIcon,
} from "lucide-react";
import { cn, humanize } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { markAllReadAction, markReadAction } from "./actions";

export interface NotificationRow {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  createdAt: string;
}

/** Map each NotificationType to a lucide icon (falls back to a bell). */
const ICONS: Record<string, LucideIcon> = {
  LAB_ORDER_NEW: FlaskConical,
  LAB_RESULTS_READY: ClipboardCheck,
  DRUG_ORDER_NEW: Pill,
  DRUG_DISPENSED: PackageCheck,
  VISIT_COMPLETED: ClipboardCheck,
  REFERRAL_ISSUED: Send,
  ADMISSION: BedDouble,
  LEAVE_SUBMITTED: CalendarClock,
  LEAVE_DECISION: FileText,
  STOCK_LOW: PackageX,
  GENERIC: Bell,
};

function iconFor(type: string): LucideIcon {
  return ICONS[type] ?? Bell;
}

export function MarkAllReadButton({ unreadCount }: { unreadCount: number }) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();

  const onClick = () => {
    startTransition(async () => {
      const r = await markAllReadAction();
      if (r.ok) {
        toast.success("All notifications marked as read");
        router.refresh();
      } else {
        toast.error("Could not update notifications");
      }
    });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={pending || unreadCount === 0}
    >
      {pending ? <Loader2 className="animate-spin" /> : <CheckCheck />}
      Mark all read
    </Button>
  );
}

export function NotificationList({ notifications }: { notifications: NotificationRow[] }) {
  if (notifications.length === 0) {
    return (
      <EmptyState
        icon={Bell}
        title="You’re all caught up"
        description="New notifications about lab orders, prescriptions, referrals and more will show up here."
      />
    );
  }

  return (
    <ul className="space-y-2">
      {notifications.map((n) => (
        <NotificationItem key={n.id} notification={n} />
      ))}
    </ul>
  );
}

function NotificationItem({ notification: n }: { notification: NotificationRow }) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  const Icon = iconFor(n.type);

  const activate = () => {
    startTransition(async () => {
      if (!n.read) {
        const r = await markReadAction(n.id);
        if (!r.ok) {
          toast.error("Could not mark as read");
          return;
        }
      }
      if (n.link) router.push(n.link);
      else router.refresh();
    });
  };

  return (
    <li>
      <button
        type="button"
        onClick={activate}
        disabled={pending}
        className={cn(
          "group flex w-full items-start gap-3 rounded-xl border border-border bg-card px-4 py-3.5 text-left card-shadow transition-colors",
          "hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          !n.read && "border-l-4 border-l-primary",
        )}
      >
        <span
          className={cn(
            "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg",
            n.read ? "bg-muted text-muted-foreground" : "bg-accent text-accent-foreground",
          )}
        >
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Icon className="size-[18px]" />}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className={cn("truncate text-sm", n.read ? "font-medium text-foreground" : "font-semibold text-foreground")}>
              {n.title}
            </p>
            {!n.read && (
              <span className="size-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />
            )}
          </div>
          {n.body && <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{n.body}</p>}
          <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground/70">
            <span className="uppercase tracking-wide">{humanize(n.type)}</span>
            <span aria-hidden>·</span>
            <span>{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</span>
          </div>
        </div>
      </button>
    </li>
  );
}
