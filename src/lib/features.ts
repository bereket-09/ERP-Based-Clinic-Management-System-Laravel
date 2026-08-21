import type { FeatureCategory } from "@prisma/client";

/**
 * Canonical registry of feature toggles (Fowler-style). This is the source of
 * truth; the DB `FeatureFlag` rows mirror it and let a manager flip them at
 * runtime. Gate UI, nav and server actions on `isFeatureEnabled(key)`.
 */
export interface FeatureDef {
  key: string;
  name: string;
  description: string;
  category: FeatureCategory;
  defaultEnabled: boolean;
  group: string;
}

export const FEATURES: FeatureDef[] = [
  // ── Modules (tenant capabilities / white-label) ──────────────────────────
  { key: "module.reception", name: "Reception & registration", description: "Front-desk registration and visit intake.", category: "TENANT", defaultEnabled: true, group: "Modules" },
  { key: "module.triage", name: "Nurse triage", description: "Vitals capture and triage queue.", category: "TENANT", defaultEnabled: true, group: "Modules" },
  { key: "module.doctor", name: "Consultations", description: "Doctor consultation workspace.", category: "TENANT", defaultEnabled: true, group: "Modules" },
  { key: "module.lab", name: "Laboratory", description: "Lab orders, worklist and results.", category: "TENANT", defaultEnabled: true, group: "Modules" },
  { key: "module.pharmacy", name: "Pharmacy", description: "Dispensing and medicine inventory.", category: "TENANT", defaultEnabled: true, group: "Modules" },
  { key: "module.wards", name: "Wards & admissions", description: "Inpatient beds and admissions.", category: "TENANT", defaultEnabled: true, group: "Modules" },
  { key: "module.referrals", name: "Referrals", description: "External hospital referrals.", category: "TENANT", defaultEnabled: true, group: "Modules" },
  { key: "module.hr", name: "Human resources", description: "Staff, leave, attendance & payroll.", category: "TENANT", defaultEnabled: true, group: "Modules" },
  { key: "module.store", name: "Store & assets", description: "Non-medical inventory and assets.", category: "TENANT", defaultEnabled: true, group: "Modules" },
  { key: "module.reports", name: "Reports & analytics", description: "Management dashboards.", category: "TENANT", defaultEnabled: true, group: "Modules" },
  { key: "module.portal", name: "Student portal", description: "Student self-service portal.", category: "TENANT", defaultEnabled: true, group: "Modules" },
  { key: "module.billing", name: "Billing & cashier", description: "Charges, invoices and payments.", category: "TENANT", defaultEnabled: true, group: "Modules" },
  { key: "module.appointments", name: "Appointments", description: "Scheduling and calendar.", category: "TENANT", defaultEnabled: true, group: "Modules" },

  // ── Clinical features ────────────────────────────────────────────────────
  { key: "clinical.sims_lookup", name: "SIMS student lookup", description: "Fetch student details from the university SIMS.", category: "TENANT", defaultEnabled: true, group: "Clinical" },
  { key: "clinical.allergies", name: "Allergy list", description: "Record and warn on patient allergies.", category: "RELEASE", defaultEnabled: true, group: "Clinical" },
  { key: "clinical.problem_list", name: "Problem list", description: "Longitudinal problem/condition list.", category: "RELEASE", defaultEnabled: true, group: "Clinical" },
  { key: "clinical.vitals_trends", name: "Vitals trends", description: "Charted vitals over time.", category: "RELEASE", defaultEnabled: true, group: "Clinical" },
  { key: "clinical.immunization", name: "Immunizations", description: "Vaccination records.", category: "RELEASE", defaultEnabled: true, group: "Clinical" },
  { key: "clinical.icd10", name: "ICD-10 coding", description: "Structured diagnosis coding.", category: "RELEASE", defaultEnabled: true, group: "Clinical" },
  { key: "clinical.consent", name: "Consent capture", description: "Record patient consent for procedures.", category: "RELEASE", defaultEnabled: false, group: "Clinical" },

  // ── Documents ────────────────────────────────────────────────────────────
  { key: "docs.sick_leave", name: "Sick-leave certificates", description: "Printable sick-leave documents.", category: "TENANT", defaultEnabled: true, group: "Documents" },
  { key: "docs.prescription_print", name: "Prescription printout", description: "Printable prescriptions.", category: "TENANT", defaultEnabled: true, group: "Documents" },
  { key: "docs.referral_print", name: "Referral letter", description: "Printable referral letters.", category: "TENANT", defaultEnabled: true, group: "Documents" },
  { key: "docs.lab_report_print", name: "Lab report printout", description: "Printable lab reports.", category: "TENANT", defaultEnabled: true, group: "Documents" },

  // ── HR / Store ─────────────────────────────────────────────────────────────
  { key: "hr.attendance", name: "Attendance & shifts", description: "Clock-in/out and rosters.", category: "RELEASE", defaultEnabled: true, group: "HR & Store" },
  { key: "hr.payroll", name: "Payroll", description: "Salary and payslips.", category: "RELEASE", defaultEnabled: false, group: "HR & Store" },
  { key: "hr.leave_balances", name: "Leave balances", description: "Per-employee leave entitlements.", category: "RELEASE", defaultEnabled: true, group: "HR & Store" },
  { key: "store.purchase_orders", name: "Purchase orders", description: "Procurement and goods-receipt.", category: "RELEASE", defaultEnabled: true, group: "HR & Store" },
  { key: "store.stock_counts", name: "Stock counts", description: "Physical inventory counts.", category: "RELEASE", defaultEnabled: true, group: "HR & Store" },

  // ── Platform / UX ──────────────────────────────────────────────────────────
  { key: "ux.command_palette", name: "Command palette", description: "Global ⌘K quick navigation & search.", category: "RELEASE", defaultEnabled: true, group: "Platform" },
  { key: "ux.dark_mode", name: "Dark mode", description: "Theme switcher.", category: "RELEASE", defaultEnabled: true, group: "Platform" },
  { key: "ux.notifications", name: "Notifications centre", description: "In-app notifications.", category: "OPS", defaultEnabled: true, group: "Platform" },
  { key: "platform.audit_log", name: "Audit log", description: "Full activity audit trail.", category: "OPS", defaultEnabled: true, group: "Platform" },
  { key: "platform.two_factor", name: "Two-factor auth", description: "Optional 2FA for staff.", category: "PERMISSION", defaultEnabled: false, group: "Platform" },
  { key: "platform.white_label", name: "White-label branding", description: "Custom colours, name and logo.", category: "TENANT", defaultEnabled: true, group: "Platform" },
];

export const FEATURE_KEYS = FEATURES.map((f) => f.key);
export type FeatureKey = (typeof FEATURES)[number]["key"];

export const FEATURE_MAP = new Map(FEATURES.map((f) => [f.key, f]));
