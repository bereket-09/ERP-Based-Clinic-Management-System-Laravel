import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { Search, Users, UserPlus, ChevronRight, IdCard } from "lucide-react";
import { requireStaff } from "@/server/session";
import { db } from "@/server/db";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/empty-state";
import { humanize } from "@/lib/utils";

export const metadata = { title: "Patients" };

const PAGE_SIZE = 20;

/** Whole-year age from a birthday, or null if unknown. */
function ageFrom(birthday: Date | null): number | null {
  if (!birthday) return null;
  const now = new Date();
  let age = now.getFullYear() - birthday.getFullYear();
  const m = now.getMonth() - birthday.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birthday.getDate())) age--;
  return age >= 0 && age < 130 ? age : null;
}

const SEX_ABBR: Record<string, string> = { MALE: "M", FEMALE: "F", OTHER: "—" };

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; show?: string }>;
}) {
  await requireStaff();
  const { q, show } = await searchParams;
  const query = q?.trim() || "";

  // Bounded fetch: never load the whole table into memory. `show` accumulates in
  // PAGE_SIZE steps so "Load more" feels instant while staying server-rendered.
  const take = Math.min(Math.max(Number(show) || PAGE_SIZE, PAGE_SIZE), 500);

  const where: Prisma.PatientWhereInput = query
    ? {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { mrn: { contains: query, mode: "insensitive" } },
          { studentId: { contains: query, mode: "insensitive" } },
          { phone: { contains: query } },
        ],
      }
    : {};

  const [patients, total] = await Promise.all([
    db.patient.findMany({
      where,
      select: {
        id: true,
        mrn: true,
        studentId: true,
        name: true,
        gender: true,
        birthday: true,
        college: true,
        program: true,
        yearOfStudy: true,
        phone: true,
      },
      orderBy: [{ createdAt: "desc" }],
      take,
    }),
    db.patient.count({ where }),
  ]);

  const hasMore = patients.length < total;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Patients"
        description="Search the clinic record by name, MRN, or student ID."
        icon={Users}
        actions={
          <Button asChild variant="primary">
            <Link href="/reception">
              <UserPlus className="size-4" /> Register patient
            </Link>
          </Button>
        }
      />

      <form className="flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="q"
            defaultValue={query}
            placeholder="Search by name, MRN, or student ID…"
            className="pl-9"
            autoFocus
            autoComplete="off"
          />
        </div>
        <Button type="submit">Search</Button>
      </form>

      <div className="flex items-center justify-between px-1 text-sm text-muted-foreground">
        <span>
          {query ? (
            <>
              <span className="font-medium text-foreground tabular-nums">{total}</span>{" "}
              {total === 1 ? "match" : "matches"} for “{query}”
            </>
          ) : (
            <>
              <span className="font-medium text-foreground tabular-nums">{total}</span> patients on file
            </>
          )}
        </span>
        {hasMore && (
          <span className="tabular-nums">
            Showing {patients.length} of {total}
          </span>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          {patients.length === 0 ? (
            <EmptyState
              title={query ? "No matching patients" : "No patients yet"}
              description={
                query ? "Try a different name, MRN, or student ID." : "Register the first patient from reception."
              }
              icon={Users}
              className="m-5"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>MRN</TableHead>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Age / Sex</TableHead>
                  <TableHead>College / Year</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((p) => {
                  const age = ageFrom(p.birthday);
                  const sex = p.gender ? SEX_ABBR[p.gender] ?? humanize(p.gender) : null;
                  return (
                    <TableRow key={p.id} className="group">
                      <TableCell>
                        <Link
                          href={`/patients/${p.id}`}
                          className="inline-flex items-center gap-1.5 font-mono text-xs font-medium tabular-nums text-foreground group-hover:text-primary"
                        >
                          <IdCard className="size-3.5 text-muted-foreground" />
                          {p.mrn}
                        </Link>
                      </TableCell>
                      <TableCell className="tabular-nums text-muted-foreground">{p.studentId ?? "—"}</TableCell>
                      <TableCell>
                        <Link href={`/patients/${p.id}`} className="font-medium group-hover:text-primary">
                          {p.name}
                        </Link>
                      </TableCell>
                      <TableCell className="tabular-nums text-muted-foreground">
                        {age !== null ? age : "—"}
                        {sex ? ` · ${sex}` : ""}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {p.college ?? p.program ?? "—"}
                        {p.yearOfStudy ? ` · Yr ${p.yearOfStudy}` : ""}
                      </TableCell>
                      <TableCell className="tabular-nums text-muted-foreground">{p.phone ?? "—"}</TableCell>
                      <TableCell>
                        <Link
                          href={`/patients/${p.id}`}
                          aria-label={`Open ${p.name}`}
                          className="flex justify-end text-muted-foreground group-hover:text-primary"
                        >
                          <ChevronRight className="size-4" />
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {hasMore && (
        <div className="flex justify-center">
          <Button asChild variant="outline">
            <Link
              href={{ pathname: "/patients", query: { ...(query ? { q: query } : {}), show: take + PAGE_SIZE } }}
              scroll={false}
            >
              Load more
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
