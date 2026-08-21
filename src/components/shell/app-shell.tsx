"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, LogOut, Menu, User as UserIcon, X } from "lucide-react";
import type { Role } from "@prisma/client";
import { cn, initials } from "@/lib/utils";
import { NAV } from "@/lib/nav";
import { canAccess } from "@/lib/rbac";
import { roleLabel } from "@/lib/rbac";
import { LogoMark } from "@/components/brand";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOutAction } from "@/app/actions/auth";
import { humanize } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";
import { CommandPalette } from "./command-palette";

export interface ShellNotification {
  id: string;
  title: string;
  body: string | null;
  link: string | null;
  type: string;
  createdAt: string;
}

interface Props {
  user: { name: string; email?: string | null; role: Role | null };
  notifications: ShellNotification[];
  unreadCount: number;
  features: string[];
  children: React.ReactNode;
}

export function AppShell({ user, notifications, unreadCount, features, children }: Props) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-dvh bg-background">
      {/* Sidebar (desktop) */}
      <Sidebar role={user.role} features={features} className="hidden lg:flex" />

      {/* Sidebar (mobile drawer) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <Sidebar role={user.role} features={features} className="absolute inset-y-0 left-0 flex" onClose={() => setMobileOpen(false)} />
        </div>
      )}

      {/* Main column */}
      <div className="lg:pl-64">
        <header className="no-print sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur sm:px-6">
          <button
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </button>

          {features.includes("ux.command_palette") && (
            <CommandPalette role={user.role} features={features} />
          )}

          <div className="ml-auto flex items-center gap-1.5">
            {features.includes("ux.dark_mode") && <ThemeToggle />}
            <NotificationBell notifications={notifications} unreadCount={unreadCount} />
            <UserMenu name={user.name} role={user.role} email={user.email} />
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </div>
    </div>
  );
}

function Sidebar({
  role,
  features,
  className,
  onClose,
}: {
  role: Role | null;
  features: string[];
  className?: string;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const featureSet = new Set(features);
  return (
    <aside
      className={cn(
        "z-50 h-dvh w-64 flex-col bg-sidebar text-sidebar-foreground",
        "fixed inset-y-0 left-0",
        className,
      )}
    >
      <div className="flex h-16 items-center justify-between px-5">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <LogoMark className="size-9" />
          <div className="leading-tight">
            <div className="text-sm font-semibold text-white">DDU Clinic</div>
            <div className="text-[11px] text-sidebar-muted">Student Clinic Center</div>
          </div>
        </Link>
        {onClose && (
          <button onClick={onClose} className="rounded-md p-1.5 text-sidebar-muted hover:bg-sidebar-accent lg:hidden">
            <X className="size-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-6">
        {NAV.map((group) => {
          const items = group.items.filter(
            (i) => canAccess(i.section, role) && (!i.feature || featureSet.has(i.feature)),
          );
          if (items.length === 0) return null;
          return (
            <div key={group.label} className="mb-5">
              <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-sidebar-muted">
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {items.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                          active
                            ? "bg-sidebar-accent font-medium text-white"
                            : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-white",
                        )}
                      >
                        {active && (
                          <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-sidebar-active" />
                        )}
                        <item.icon className="size-[18px] shrink-0" />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border px-5 py-3 text-[11px] text-sidebar-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-success" /> On-prem ready · v2.0
        </span>
      </div>
    </aside>
  );
}

function NotificationBell({
  notifications,
  unreadCount,
}: {
  notifications: ShellNotification[];
  unreadCount: number;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative rounded-lg p-2 text-muted-foreground hover:bg-muted" aria-label="Notifications">
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 flex min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">You’re all caught up.</p>
        ) : (
          notifications.map((n) => (
            <DropdownMenuItem key={n.id} asChild>
              <Link href={n.link ?? "#"} className="flex flex-col items-start gap-0.5">
                <span className="text-sm font-medium">{n.title}</span>
                {n.body && <span className="text-xs text-muted-foreground">{n.body}</span>}
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground/70">
                  {humanize(n.type)}
                </span>
              </Link>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function UserMenu({
  name,
  role,
  email,
}: {
  name: string;
  role: Role | null;
  email?: string | null;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2.5 rounded-lg py-1.5 pl-1.5 pr-2 hover:bg-muted">
          <Avatar>
            <AvatarFallback>{initials(name)}</AvatarFallback>
          </Avatar>
          <div className="hidden text-left sm:block">
            <div className="text-sm font-medium leading-tight">{name}</div>
            <div className="text-xs text-muted-foreground">{roleLabel(role)}</div>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="font-medium text-foreground">{name}</div>
          {email && <div className="text-xs font-normal text-muted-foreground">{email}</div>}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile">
            <UserIcon className="size-4" /> My profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <form action={signOutAction}>
          <button type="submit" className="w-full">
            <DropdownMenuItem className="text-destructive focus:text-destructive">
              <LogOut className="size-4" /> Sign out
            </DropdownMenuItem>
          </button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
