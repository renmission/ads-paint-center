import { db } from "@/shared/lib/db";
import { products, inventory, units } from "@/shared/lib/db/schema";
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

export type UnitOption = {
  id: string;
  name: string;
  abbreviation: string;
};

export async function InventoryTable() {
  const [rows, unitRows] = await Promise.all([
    db
      .select()
      .from(products)
      .leftJoin(inventory, eq(inventory.productId, products.id))
      .orderBy(asc(products.createdAt)),
    db
      .select({
        id: units.id,
        name: units.name,
        abbreviation: units.abbreviation,
      })
      .from(units)
      .where(eq(units.isActive, true))
      .orderBy(asc(units.name)),
  ]);

  const data: InventoryRow[] = rows.map((r) => ({
    product: r.products,
    inventory: r.inventory,
  }));

  return <InventoryTableClient initialData={data} units={unitRows} />;
}
