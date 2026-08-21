import Link from "next/link";
import { ShoppingCart, ArrowLeft } from "lucide-react";
import { requireRole } from "@/server/session";
import { db } from "@/server/db";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { PurchaseOrderForm } from "./po-form";

export const metadata = { title: "New purchase order" };

export default async function NewPurchaseOrderPage() {
  await requireRole("STORE_KEEPER", "MANAGER");

  const [suppliers, medications] = await Promise.all([
    db.supplier.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    db.medication.findMany({
      where: { isActive: true },
      select: { id: true, name: true, strength: true, form: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="New purchase order"
        description="Add line items, link medications where relevant, and place the order."
        icon={ShoppingCart}
        actions={
          <Button variant="ghost" asChild>
            <Link href="/store/purchase-orders">
              <ArrowLeft className="size-4" /> Purchase orders
            </Link>
          </Button>
        }
      />
      <PurchaseOrderForm suppliers={suppliers} medications={medications} />
    </div>
  );
}
