import "server-only";

/**
 * Student Information System (SIMS) integration — pluggable.
 *
 * The clinic can optionally fetch a student's details from the university SIMS by
 * their ID instead of re-typing them. Today a deterministic MOCK provider is used;
 * point SIMS_PROVIDER=http + SIMS_BASE_URL/SIMS_API_KEY at the real endpoint to go
 * live without touching any calling code.
 */

export interface SimsStudent {
  studentId: string;
  name: string;
  gender: "MALE" | "FEMALE" | "OTHER" | null;
  birthday: string | null; // ISO
  college: string | null;
  program: string | null;
  yearOfStudy: string | null;
  phone: string | null;
  bloodType: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  photoUrl: string | null;
}

export interface SimsProvider {
  readonly name: string;
  lookup(studentId: string): Promise<SimsStudent | null>;
}

// ── Mock provider ────────────────────────────────────────────────────────────
const COLLEGES = [
  { college: "College of Computing", programs: ["Software Engineering", "Computer Science", "Information Systems"] },
  { college: "College of Engineering", programs: ["Civil Engineering", "Electrical Engineering", "Mechanical Engineering"] },
  { college: "College of Medicine", programs: ["Medicine", "Nursing", "Public Health"] },
  { college: "College of Business", programs: ["Accounting", "Management", "Economics"] },
  { college: "College of Natural Sciences", programs: ["Biology", "Chemistry", "Physics"] },
];
const FIRST = ["Abel", "Meron", "Nahom", "Bethlehem", "Yohannes", "Selam", "Dawit", "Hanna", "Kirubel", "Lydia", "Robel", "Sara"];
const LAST = ["Tesfaye", "Haile", "Girmay", "Assefa", "Kebede", "Tadesse", "Bekele", "Mekonnen", "Alemu", "Fikru"];

/** Stable hash so the same ID always yields the same person. */
function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

const mockProvider: SimsProvider = {
  name: "mock",
  async lookup(studentId) {
    const id = studentId.trim();
    // Accept the campus format like DDU/1234/14 (or any non-trivial id).
    if (!/^[A-Za-z0-9/_-]{4,}$/.test(id)) return null;
    const h = hash(id.toUpperCase());
    const col = COLLEGES[h % COLLEGES.length];
    const first = FIRST[(h >> 3) % FIRST.length];
    const last = LAST[(h >> 7) % LAST.length];
    const gender = (h & 1) === 0 ? "MALE" : "FEMALE";
    const yearNum = ((h >> 5) % 5) + 1;
    const blood = ["O+", "A+", "B+", "AB+", "O-", "A-"][(h >> 9) % 6];
    const age = 18 + ((h >> 11) % 6);
    const birthYear = new Date().getFullYear() - age;
    return {
      studentId: id,
      name: `${first} ${last}`,
      gender,
      birthday: `${birthYear}-0${(h % 9) + 1}-1${h % 9}`,
      college: col.college,
      program: col.programs[(h >> 4) % col.programs.length],
      yearOfStudy: String(yearNum),
      phone: "+2519" + (10000000 + (h % 89999999)),
      bloodType: blood,
      emergencyContactName: `${FIRST[(h >> 2) % FIRST.length]} ${last}`,
      emergencyContactPhone: "+2519" + (10000000 + ((h * 7) % 89999999)),
      photoUrl: null,
    };
  },
};

// ── HTTP provider (real SIMS) ────────────────────────────────────────────────
function httpProvider(baseUrl: string, apiKey: string): SimsProvider {
  return {
    name: "http",
    async lookup(studentId) {
      try {
        const res = await fetch(`${baseUrl.replace(/\/$/, "")}/students/${encodeURIComponent(studentId)}`, {
          headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json" },
          cache: "no-store",
        });
        if (!res.ok) return null;
        const d = await res.json();
        // Map the SIMS payload → our shape. Adjust field names to the real API.
        return {
          studentId: d.studentId ?? studentId,
          name: d.fullName ?? d.name ?? "",
          gender: (d.gender ?? "").toUpperCase() || null,
          birthday: d.dateOfBirth ?? null,
          college: d.college ?? d.faculty ?? null,
          program: d.program ?? d.department ?? null,
          yearOfStudy: d.year != null ? String(d.year) : null,
          phone: d.phone ?? null,
          bloodType: d.bloodType ?? null,
          emergencyContactName: d.emergencyContact?.name ?? null,
          emergencyContactPhone: d.emergencyContact?.phone ?? null,
          photoUrl: d.photoUrl ?? null,
        };
      } catch {
        return null;
      }
    },
  };
}

export function getSimsProvider(): SimsProvider {
  const provider = process.env.SIMS_PROVIDER ?? "mock";
  if (provider === "http" && process.env.SIMS_BASE_URL) {
    return httpProvider(process.env.SIMS_BASE_URL, process.env.SIMS_API_KEY ?? "");
  }
  return mockProvider;
}
