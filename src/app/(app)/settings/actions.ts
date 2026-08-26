"use server";
import { requireRole } from "@/server/session";
import { setFeatureFlag, setBranding, syncFeatureRegistry, type Branding } from "@/server/services/settings";
import { audit } from "@/server/services/events";

export async function toggleFeatureAction(key: string, enabled: boolean) {
  const actor = await requireRole("MANAGER");
  await setFeatureFlag(key, { enabled }, actor.id);
  await audit(actor.id, enabled ? "feature.enable" : "feature.disable", "FeatureFlag", key);
  return { ok: true };
}

export async function saveBrandingAction(patch: Partial<Branding>) {
  const actor = await requireRole("MANAGER");
  await setBranding(patch);
  await audit(actor.id, "branding.update", "Setting", "branding", patch);
  return { ok: true };
}

export async function syncFeaturesAction() {
  await requireRole("MANAGER");
  await syncFeatureRegistry();
  return { ok: true };
}
