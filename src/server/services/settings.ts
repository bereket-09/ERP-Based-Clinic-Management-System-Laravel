import "server-only";
import { cache } from "react";
import { revalidatePath } from "next/cache";
import type { Role } from "@prisma/client";
import { db } from "@/server/db";
import { FEATURES, FEATURE_MAP } from "@/lib/features";

// ── Feature flags ────────────────────────────────────────────────────────────

interface FlagState {
  enabled: boolean;
  rolloutRoles: Role[];
}

/** DB flag rows keyed by feature key (request-cached). */
const loadFlags = cache(async (): Promise<Map<string, FlagState>> => {
  const rows = await db.featureFlag.findMany();
  return new Map(rows.map((r) => [r.key, { enabled: r.enabled, rolloutRoles: r.rolloutRoles }]));
});

/** Resolve a feature: DB row wins, else registry default. Honors PERMISSION roles. */
export async function isFeatureEnabled(key: string, role?: Role | null): Promise<boolean> {
  const flags = await loadFlags();
  const def = FEATURE_MAP.get(key);
  const row = flags.get(key);
  const enabled = row?.enabled ?? def?.defaultEnabled ?? false;
  if (!enabled) return false;
  const roles = row?.rolloutRoles ?? [];
  if (roles.length > 0) return !!role && (role === "MANAGER" || roles.includes(role));
  return true;
}

/** Set of enabled feature keys for the given role (for nav/UI filtering). */
export const enabledFeatureSet = cache(async (role?: Role | null): Promise<Set<string>> => {
  const flags = await loadFlags();
  const out = new Set<string>();
  for (const def of FEATURES) {
    const row = flags.get(def.key);
    const enabled = row?.enabled ?? def.defaultEnabled;
    if (!enabled) continue;
    const roles = row?.rolloutRoles ?? [];
    if (roles.length > 0 && !(role && (role === "MANAGER" || roles.includes(role)))) continue;
    out.add(def.key);
  }
  return out;
});

/** All flags merged (registry + DB state) for the admin toggle UI. */
export async function listFlags() {
  const flags = await loadFlags();
  return FEATURES.map((def) => {
    const row = flags.get(def.key);
    return {
      ...def,
      enabled: row?.enabled ?? def.defaultEnabled,
      rolloutRoles: row?.rolloutRoles ?? [],
      overridden: !!row,
    };
  });
}

export async function setFeatureFlag(
  key: string,
  patch: { enabled?: boolean; rolloutRoles?: Role[] },
  actorId?: string,
) {
  const def = FEATURE_MAP.get(key);
  if (!def) throw new Error(`Unknown feature: ${key}`);
  await db.featureFlag.upsert({
    where: { key },
    create: {
      key,
      name: def.name,
      description: def.description,
      category: def.category,
      enabled: patch.enabled ?? def.defaultEnabled,
      rolloutRoles: patch.rolloutRoles ?? [],
      updatedById: actorId,
    },
    update: { ...patch, updatedById: actorId },
  });
  revalidatePath("/", "layout");
}

/** Upsert every registry flag into the DB (idempotent) so they’re all visible. */
export async function syncFeatureRegistry() {
  for (const def of FEATURES) {
    await db.featureFlag.upsert({
      where: { key: def.key },
      create: { key: def.key, name: def.name, description: def.description, category: def.category, enabled: def.defaultEnabled },
      update: { name: def.name, description: def.description, category: def.category },
    });
  }
}

// ── Branding (white-label) ───────────────────────────────────────────────────

export interface Branding {
  appName: string;
  orgName: string;
  primary: string;
  primaryHover: string;
  gold: string;
  sidebar: string;
}

export const DEFAULT_BRANDING: Branding = {
  appName: "DDU Clinic",
  orgName: "Dire Dawa University Student Clinic Center",
  primary: "#1a56b0",
  primaryHover: "#14468f",
  gold: "#e0a112",
  sidebar: "#0c1f3d",
};

export const getBranding = cache(async (): Promise<Branding> => {
  // Branding is on the root layout, so it must never hard-fail: if the DB is
  // briefly unavailable (build-time prerender, a blip), fall back to defaults.
  try {
    const row = await db.setting.findUnique({ where: { key: "branding" } });
    return { ...DEFAULT_BRANDING, ...((row?.value as Partial<Branding>) ?? {}) };
  } catch {
    return { ...DEFAULT_BRANDING };
  }
});

export async function setBranding(patch: Partial<Branding>) {
  const current = await getBranding();
  const value = { ...current, ...patch };
  await db.setting.upsert({
    where: { key: "branding" },
    create: { key: "branding", value },
    update: { value },
  });
  revalidatePath("/", "layout");
}

/** CSS that overrides the theme tokens from branding — injected in the layout. */
export function brandingCss(b: Branding): string {
  return `:root{--primary:${b.primary};--primary-hover:${b.primaryHover};--ring:${b.primary};--gold:${b.gold};--sidebar:${b.sidebar};}`;
}
