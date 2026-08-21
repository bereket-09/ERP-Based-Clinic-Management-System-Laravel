import Link from "next/link";
import { Package, Search, ArrowLeft, ArrowRight } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { requireRole } from "@/server/session";
import { db } from "@/server/db";
import { birr } from "@/lib/money";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/empty-state";
import { AddAssetButton } from "./assets-client";

export const metadata = { title: "Asset register" };

export default async function AssetsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireRole("STORE_KEEPER", "MANAGER");
  const { q } = await searchParams;

  const where: Prisma.AssetWhereInput = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { tag: { contains: q, mode: "insensitive" } },
          { category: { contains: q, mode: "insensitive" } },
          { serialNo: { contains: q, mode: "insensitive" } },
        ],
      }
    : {};

  const assets = await db.asset.findMany({
    where,
    include: { _count: { select: { assignments: { where: { state: "ASSIGNED" } } } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Asset register"
        description="Every tracked piece of equipment and its current holders."
        icon={Package}
        actions={
          <>
            <Button variant="ghost" asChild>
              <Link href="/store">
                <ArrowLeft className="size-4" /> Store
              </Link>
            </Button>
            <AddAssetButton />
          </>
        }
      />

      <form className="flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input name="q" defaultValue={q} placeholder="Search by name, tag, serial or category…" className="pl-9" />
        </div>
        <Button type="submit">Search</Button>
      </form>

      <Card>
        <CardContent className="p-0">
          {assets.length === 0 ? (
            <EmptyState
              title={q ? "No matching assets" : "No assets yet"}
              description={q ? "Try a different search." : "Register your first asset to start tracking it."}
              icon={Package}
              className="m-5"
              action={q ? undefined : <AddAssetButton />}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tag</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Unit price</TableHead>
                  <TableHead className="text-right">Assigned</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {assets.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">{a.tag}</TableCell>
                    <TableCell className="font-medium">
                      <Link href={`/store/assets/${a.id}`} className="hover:text-primary">
                        {a.name}
                      </Link>
                      {a.serialNo && <span className="block text-xs text-muted-foreground">SN: {a.serialNo}</span>}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{a.category ?? "—"}</TableCell>
                    <TableCell className="text-right tabular-nums">{a.quantity}</TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">{birr(a.unitPrice)}</TableCell>
                    <TableCell className="text-right">
                      {a._count.assignments > 0 ? (
                        <Badge variant="info">{a._count.assignments} out</Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/store/assets/${a.id}`}>
                          Manage <ArrowRight className="size-4" />
                        </Link>
                      </Button>
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
