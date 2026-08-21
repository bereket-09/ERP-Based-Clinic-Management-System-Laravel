import { LogOut } from "lucide-react";
import { requireStudent } from "@/server/session";
import { signOutAction } from "@/app/actions/auth";
import { LogoMark } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { NavLink } from "./nav-link";

export const metadata = { title: "Student Health Portal" };

const NAV = [
  { href: "/portal", label: "Overview" },
  { href: "/portal/history", label: "My Visits" },
  { href: "/portal/documents", label: "Documents" },
  { href: "/portal/requests", label: "Request Sick Leave" },
];

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const actor = await requireStudent();

  return (
    <div className="min-h-screen bg-background">
      <header className="no-print sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <LogoMark className="size-9" />
            <div className="leading-tight">
              <div className="text-[15px] font-semibold tracking-tight text-foreground">
                Student Health Portal
              </div>
              <div className="text-[11px] text-muted-foreground">DDU Clinic Center</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">{actor.name}</span>
            <form action={signOutAction}>
              <Button type="submit" variant="outline" size="sm">
                <LogOut />
                <span className="hidden sm:inline">Sign out</span>
              </Button>
            </form>
          </div>
        </div>

        <nav className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="flex items-center gap-6 overflow-x-auto">
            {NAV.map((item) => (
              <NavLink key={item.href} href={item.href} label={item.label} />
            ))}
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
