import { ToggleRight } from "lucide-react";
import { requireRole } from "@/server/session";
import { listFlags } from "@/server/services/settings";
import { PageHeader } from "@/components/page-header";
import { FeatureToggles } from "./feature-toggles";

export const metadata = { title: "Feature toggles" };

export default async function FeaturesPage() {
  await requireRole("MANAGER");
  const flags = await listFlags();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Feature toggles"
        description="Turn capabilities on or off across the whole platform — release, ops, permission and white-label toggles."
        icon={ToggleRight}
      />
      <FeatureToggles flags={flags} />
    </div>
  );
}
