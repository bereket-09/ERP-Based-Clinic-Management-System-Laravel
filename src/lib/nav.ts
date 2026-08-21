import {
  LayoutDashboard,
  Users,
  UserPlus,
  Stethoscope,
  FlaskConical,
  Pill,
  BedDouble,
  Send,
  CalendarDays,
  Boxes,
  IdCard,
  BarChart3,
  Activity,
  CalendarClock,
  Receipt,
  Settings,
  type LucideIcon,
} from "lucide-react";
import type { Section } from "@/lib/rbac";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  section: Section;
  /** Optional feature-toggle key; item hidden when the feature is disabled. */
  feature?: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const NAV: NavGroup[] = [
  {
    label: "Clinical",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, section: "dashboard" },
      { label: "Reception", href: "/reception", icon: UserPlus, section: "reception", feature: "module.reception" },
      { label: "Patients", href: "/patients", icon: Users, section: "patients" },
      { label: "Appointments", href: "/appointments", icon: CalendarClock, section: "appointments", feature: "module.appointments" },
      { label: "Triage", href: "/triage", icon: Activity, section: "triage", feature: "module.triage" },
      { label: "Consultations", href: "/doctor", icon: Stethoscope, section: "doctor", feature: "module.doctor" },
      { label: "Laboratory", href: "/lab", icon: FlaskConical, section: "lab", feature: "module.lab" },
      { label: "Pharmacy", href: "/pharmacy", icon: Pill, section: "pharmacy", feature: "module.pharmacy" },
      { label: "Wards", href: "/wards", icon: BedDouble, section: "wards", feature: "module.wards" },
      { label: "Referrals", href: "/referrals", icon: Send, section: "referrals", feature: "module.referrals" },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Billing", href: "/billing", icon: Receipt, section: "billing", feature: "module.billing" },
      { label: "Human Resources", href: "/hr", icon: CalendarDays, section: "hr", feature: "module.hr" },
      { label: "Store & Assets", href: "/store", icon: Boxes, section: "store", feature: "module.store" },
      { label: "Staff Directory", href: "/staff", icon: IdCard, section: "staff" },
    ],
  },
  {
    label: "Management",
    items: [
      { label: "Reports", href: "/reports", icon: BarChart3, section: "reports", feature: "module.reports" },
      { label: "Settings", href: "/settings", icon: Settings, section: "settings" },
    ],
  },
];
