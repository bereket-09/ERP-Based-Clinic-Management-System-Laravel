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
  type LucideIcon,
} from "lucide-react";
import type { Section } from "@/lib/rbac";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  section: Section;
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
      { label: "Reception", href: "/reception", icon: UserPlus, section: "reception" },
      { label: "Patients", href: "/patients", icon: Users, section: "patients" },
      { label: "Triage", href: "/triage", icon: Activity, section: "triage" },
      { label: "Consultations", href: "/doctor", icon: Stethoscope, section: "doctor" },
      { label: "Laboratory", href: "/lab", icon: FlaskConical, section: "lab" },
      { label: "Pharmacy", href: "/pharmacy", icon: Pill, section: "pharmacy" },
      { label: "Wards", href: "/wards", icon: BedDouble, section: "wards" },
      { label: "Referrals", href: "/referrals", icon: Send, section: "referrals" },
    ],
  },
  {
    label: "Administration",
    items: [
      { label: "Human Resources", href: "/hr", icon: CalendarDays, section: "hr" },
      { label: "Store & Assets", href: "/store", icon: Boxes, section: "store" },
      { label: "Staff Directory", href: "/staff", icon: IdCard, section: "staff" },
      { label: "Reports", href: "/reports", icon: BarChart3, section: "reports" },
    ],
  },
];
