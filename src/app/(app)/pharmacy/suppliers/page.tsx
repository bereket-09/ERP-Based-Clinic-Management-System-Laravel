import Link from "next/link";
import { Truck, Search, ArrowLeft, Boxes, Mail, Phone } from "lucide-react";
import { requireRole } from "@/server/session";
import { listSuppliers } from "@/server/services/inventory";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/empty-state";
import { AddSupplierButton, EditSupplierButton } from "./suppliers-client";

export const metadata = { title: "Suppliers" };

export default async function SuppliersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireRole("PHARMACIST");
  const { q } = await searchParams;
  const suppliers = await listSuppliers(q);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Suppliers"
        description="Vendors that supply the medicine store."
        icon={Truck}
        actions={
          <>
            <Button variant="ghost" asChild>
              <Link href="/pharmacy/inventory">
                <ArrowLeft className="size-4" /> Inventory
              </Link>
            </Button>
            <AddSupplierButton />
          </>
        }
      />

      <form className="flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input name="q" defaultValue={q} placeholder="Search suppliers…" className="pl-9" />
        </div>
        <Button type="submit">Search</Button>
      </form>

      <Card>
        <CardContent className="p-0">
          {suppliers.length === 0 ? (
            <EmptyState
              title={q ? "No matching suppliers" : "No suppliers yet"}
              description={q ? "Try a different search." : "Add your first supplier to link them to stock batches."}
              icon={Truck}
              className="m-5"
              action={q ? undefined : <AddSupplierButton />}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead className="text-right">Batches</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliers.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {s.phone ? (
                        <span className="inline-flex items-center gap-1">
                          <Phone className="size-3" /> {s.phone}
                        </span>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {s.email ? (
                        <span className="inline-flex items-center gap-1">
                          <Mail className="size-3" /> {s.email}
                        </span>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground">{s.address ?? "—"}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className="gap-1">
                        <Boxes className="size-3" /> {s._count.batches}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <EditSupplierButton
                        supplier={{ id: s.id, name: s.name, phone: s.phone, email: s.email, address: s.address }}
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
