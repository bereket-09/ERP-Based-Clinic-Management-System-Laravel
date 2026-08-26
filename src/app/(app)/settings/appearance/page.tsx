import { Palette } from "lucide-react";
import { requireRole } from "@/server/session";
import { getBranding } from "@/server/services/settings";
import { PageHeader } from "@/components/page-header";
import { BrandingForm } from "./branding-form";

export const metadata = { title: "Appearance" };

export default async function AppearancePage() {
  await requireRole("MANAGER");
  const branding = await getBranding();
  return (
    <div className="space-y-6">
      <PageHeader title="Appearance & branding" description="White-label the platform for your institution." icon={Palette} />
      <BrandingForm initial={branding} />
    </div>
  );
}
