import Link from "next/link";
import { ToggleRight, Palette, ShieldCheck, Building2, ScrollText, Users } from "lucide-react";
import { requireRole } from "@/server/session";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = { title: "Settings" };

const TILES = [
  { href: "/settings/features", icon: ToggleRight, title: "Feature toggles", body: "Enable or disable modules and capabilities across the platform." },
  { href: "/settings/appearance", icon: Palette, title: "Appearance & branding", body: "Colours, product name and white-label identity." },
  { href: "/settings/organization", icon: Building2, title: "Organisation", body: "Clinic details, departments and locations." },
  { href: "/staff", icon: Users, title: "Users & roles", body: "Manage staff accounts and access." },
  { href: "/settings/audit", icon: ScrollText, title: "Audit log", body: "Every state change and administrative action." },
  { href: "/settings/security", icon: ShieldCheck, title: "Security", body: "Authentication, sessions and 2FA." },
];

export default async function SettingsPage() {
  await requireRole("MANAGER");
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Configure the platform for your institution." icon={ToggleRight} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TILES.map((t) => (
          <Link key={t.href} href={t.href}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardContent className="p-5">
                <span className="flex size-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                  <t.icon className="size-5" />
                </span>
                <h3 className="mt-4 font-semibold">{t.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t.body}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
