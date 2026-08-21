import { Role } from "@prisma/client";

export const ROLE_LABELS: Record<Role, string> = {
  MANAGER: "Manager",
  DOCTOR: "Doctor",
  LAB_TECH: "Lab Technician",
  PHARMACIST: "Pharmacist",
  RECEPTIONIST: "Receptionist",
  NURSE: "Nurse",
  HR: "HR Officer",
  STORE_KEEPER: "Store Keeper",
};

export function roleLabel(role: Role | null | undefined): string {
  return role ? ROLE_LABELS[role] : "Staff";
}

/** Everyone lands on the same shell; the dashboard renders role-aware content. */
export const STAFF_HOME = "/dashboard";
export const STUDENT_HOME = "/portal";

/**
 * Which roles may access each top-level section. Used by the app shell to build
 * the sidebar and by section guards. `null` roles ⇒ every authenticated staffer.
 */
export const SECTION_ACCESS = {
  dashboard: null,
  patients: ["RECEPTIONIST", "NURSE", "DOCTOR", "MANAGER"],
  reception: ["RECEPTIONIST", "MANAGER"],
  triage: ["NURSE", "MANAGER"],
  doctor: ["DOCTOR", "MANAGER"],
  lab: ["LAB_TECH", "MANAGER"],
  pharmacy: ["PHARMACIST", "MANAGER"],
  wards: ["NURSE", "DOCTOR", "MANAGER"],
  referrals: ["DOCTOR", "RECEPTIONIST", "MANAGER"],
  appointments: ["RECEPTIONIST", "DOCTOR", "NURSE", "MANAGER"],
  billing: ["RECEPTIONIST", "MANAGER"],
  hr: ["HR", "MANAGER"],
  store: ["STORE_KEEPER", "MANAGER"],
  reports: ["MANAGER"],
  staff: ["MANAGER", "HR"],
  settings: ["MANAGER"],
} satisfies Record<string, Role[] | null>;

export type Section = keyof typeof SECTION_ACCESS;

export function canAccess(section: Section, role: Role | null | undefined): boolean {
  const allowed = SECTION_ACCESS[section];
  if (allowed === null) return !!role;
  return !!role && (allowed as readonly Role[]).includes(role);
}
