"use client";

import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ALL = "all";

/** Manager-only doctor picker — navigates with a ?doctor= filter (or clinic-wide). */
export function DoctorFilter({
  doctors,
  selected,
}: {
  doctors: { id: string; label: string }[];
  selected: string | null;
}) {
  const router = useRouter();

  function onChange(next: string) {
    if (next === ALL) router.push("/doctor/caseload");
    else router.push(`/doctor/caseload?doctor=${next}`);
  }

  return (
    <Select value={selected ?? ALL} onValueChange={onChange}>
      <SelectTrigger className="w-[220px]">
        <SelectValue placeholder="All doctors" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>All doctors (clinic-wide)</SelectItem>
        {doctors.map((d) => (
          <SelectItem key={d.id} value={d.id}>
            {d.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
