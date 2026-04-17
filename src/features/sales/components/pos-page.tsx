import { db } from "@/shared/lib/db";
import {
  inventory,
  products,
  customers as customersTable,
} from "@/shared/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { PosPageClient } from "./pos-page-client";

export async function PosPage() {
  const activeProducts = await db
    .select({
      id: products.id,
      name: products.name,
      sku: products.sku,
      imageUrl: products.imageUrl,
      unit: products.unit,
      price: products.price,
      category: products.category,
      quantityOnHand: sql<number>`COALESCE(${inventory.quantityOnHand}, 0)`,
    })
    .from(products)
    .leftJoin(inventory, eq(products.id, inventory.productId))
    .where(eq(products.isActive, true))
    .orderBy(products.name);

  const allCustomers = await db
    .select({
      id: customersTable.id,
      name: customersTable.name,
      phone: customersTable.phone,
    })
    .from(customersTable)
    .orderBy(customersTable.name);

  return <PosPageClient products={activeProducts} customers={allCustomers} />;
}
