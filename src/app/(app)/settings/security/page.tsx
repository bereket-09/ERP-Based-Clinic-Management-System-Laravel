import { ShieldCheck, KeyRound, Clock, Fingerprint } from "lucide-react";
import { requireRole } from "@/server/session";
import { isFeatureEnabled } from "@/server/services/settings";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Security" };

export default async function SecurityPage() {
  await requireRole("MANAGER");
  const twoFactor = await isFeatureEnabled("platform.two_factor");

  const items = [
    { icon: KeyRound, title: "Authentication", body: "Staff sign in with work email + password; students with their university ID. Passwords are hashed with bcrypt.", badge: "Active" },
    { icon: Fingerprint, title: "Two-factor authentication", body: "Optional TOTP second factor for staff accounts.", badge: twoFactor ? "Enabled" : "Disabled" },
    { icon: Clock, title: "Sessions", body: "JWT sessions with automatic expiry. On-leave and suspended staff are blocked from signing in.", badge: "Active" },
    { icon: ShieldCheck, title: "Access control", body: "Role-based access across every module, enforced on the server and reflected in the UI.", badge: "Active" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Security" description="Authentication, sessions and access control." icon={ShieldCheck} />
      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((i) => (
          <Card key={i.title}>
            <CardContent className="flex items-start gap-3 p-5">
              <span className="flex size-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <i.icon className="size-5" />
              </span>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold">{i.title}</h3>
                  <Badge variant={i.badge === "Disabled" ? "default" : "success"}>{i.badge}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{i.body}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
