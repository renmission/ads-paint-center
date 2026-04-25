import { db } from "@/shared/lib/db";
import { products, inventory, units } from "@/shared/lib/db/schema";
import { eq, asc, ilike, or, and, sql } from "drizzle-orm";
import { InventoryTableClient } from "./inventory-table-client";

export type InventoryRow = {
  product: {
    id: string;
    name: string;
    sku: string | null;
    description: string | null;
    imageUrl: string | null;
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

const PAGE_SIZE = 10;

export async function InventoryTable({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const page = Math.max(1, Number(searchParams.page ?? 1));
  const search = searchParams.search?.trim() ?? "";
  const category = searchParams.category ?? "all";
  const status = searchParams.status ?? "active";
  const offset = (page - 1) * PAGE_SIZE;

  const conditions = [];
  if (search)
    conditions.push(
      or(
        ilike(products.name, `%${search}%`),
        ilike(products.sku, `%${search}%`),
      ),
    );
  if (category !== "all")
    conditions.push(
      eq(
        products.category,
        category as
          | "paint"
          | "coating"
          | "primer"
          | "varnish"
          | "thinner"
          | "tool"
          | "supply"
          | "other",
      ),
    );
  if (status === "active") conditions.push(eq(products.isActive, true));
  if (status === "inactive") conditions.push(eq(products.isActive, false));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, countResult, unitRows] = await Promise.all([
    db
      .select()
      .from(products)
      .leftJoin(inventory, eq(inventory.productId, products.id))
      .where(where)
      .orderBy(asc(products.createdAt))
      .limit(PAGE_SIZE)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(where),
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

  return (
    <InventoryTableClient
      data={data}
      totalCount={Number(countResult[0]?.count ?? 0)}
      page={page}
      pageSize={PAGE_SIZE}
      search={search}
      category={category}
      status={status}
      units={unitRows}
    />
  );
}
