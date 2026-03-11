import { db } from "@/shared/lib/db";
import { products, inventory } from "@/shared/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { InventoryTableClient } from "./inventory-table-client";

export type InventoryRow = {
  product: {
    id: string;
    name: string;
    sku: string | null;
    description: string | null;
    category: string;
    unit: string;
    price: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
  inventory: {
    id: string;
    productId: string;
    quantityOnHand: number;
    lowStockThreshold: number;
    lastRestockedAt: Date | null;
    updatedAt: Date;
  } | null;
};

export async function InventoryTable() {
  const rows = await db
    .select()
    .from(products)
    .leftJoin(inventory, eq(inventory.productId, products.id))
    .orderBy(asc(products.createdAt));

  const data: InventoryRow[] = rows.map((r) => ({
    product: r.products,
    inventory: r.inventory,
  }));

  return <InventoryTableClient initialData={data} />;
}
