import Link from "next/link";
import { FlaskConical, Search, ArrowLeft, TestTubes, CircleCheck, Wallet } from "lucide-react";
import { requireRole } from "@/server/session";
import { db } from "@/server/db";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/empty-state";
import { AddLabTestButton, EditLabTestButton, LabTestActiveSwitch } from "./catalog-client";

export const metadata = { title: "Lab test catalog" };

function refRange(t: {
  refRangeText: string | null;
  refRangeLow: number | null;
  refRangeHigh: number | null;
  unit: string | null;
}): string {
  if (t.refRangeText) return t.refRangeText;
  const lo = t.refRangeLow;
  const hi = t.refRangeHigh;
  const unit = t.unit ? ` ${t.unit}` : "";
  if (lo != null && hi != null) return `${lo} – ${hi}${unit}`;
  if (lo != null) return `≥ ${lo}${unit}`;
  if (hi != null) return `≤ ${hi}${unit}`;
  return "—";
}

export default async function LabCatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireRole("LAB_TECH");
  const { q } = await searchParams;
  const term = q?.trim();

  const tests = await db.labTest.findMany({
    where: term
      ? {
          OR: [
            { name: { contains: term, mode: "insensitive" } },
            { category: { contains: term, mode: "insensitive" } },
            { specimen: { contains: term, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  const active = tests.filter((t) => t.isActive).length;
  const avgPrice = tests.length ? Math.round(tests.reduce((s, t) => s + t.price, 0) / tests.length) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lab test catalog"
        description="Define the tests the laboratory offers, their specimens, reference ranges and prices."
        icon={FlaskConical}
        actions={
          <>
            <Button variant="ghost" asChild>
              <Link href="/lab">
                <ArrowLeft className="size-4" /> Lab
              </Link>
            </Button>
            <AddLabTestButton />
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard label="Tests defined" value={tests.length} icon={TestTubes} tone="brand" />
        <StatCard label="Active tests" value={active} icon={CircleCheck} tone="success" />
        <StatCard label="Avg price (ETB)" value={avgPrice.toLocaleString()} icon={Wallet} tone="info" />
      </div>

      <form className="flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input name="q" defaultValue={q} placeholder="Search tests by name, category, specimen…" className="pl-9" />
        </div>
        <Button type="submit">Search</Button>
      </form>

      <Card>
        <CardContent className="p-0">
          {tests.length === 0 ? (
            <EmptyState
              title={term ? "No matching tests" : "No tests yet"}
              description={term ? "Try a different search." : "Add the first test to build your lab catalog."}
              icon={FlaskConical}
              className="m-5"
              action={term ? undefined : <AddLabTestButton />}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Test</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Specimen</TableHead>
                  <TableHead>Reference range</TableHead>
                  <TableHead className="text-right">Price (ETB)</TableHead>
                  <TableHead className="text-center">Active</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {tests.map((t) => (
                  <TableRow key={t.id} className={t.isActive ? undefined : "opacity-60"}>
                    <TableCell className="font-medium">{t.name}</TableCell>
                    <TableCell className="text-muted-foreground">{t.category ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{t.specimen ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{refRange(t)}</TableCell>
                    <TableCell className="text-right tabular-nums">{t.price.toLocaleString()}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        <LabTestActiveSwitch id={t.id} isActive={t.isActive} />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <EditLabTestButton
                        test={{
                          id: t.id,
                          name: t.name,
                          category: t.category,
                          specimen: t.specimen,
                          unit: t.unit,
                          refRangeLow: t.refRangeLow,
                          refRangeHigh: t.refRangeHigh,
                          refRangeText: t.refRangeText,
                          price: t.price,
                          isActive: t.isActive,
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
