"use server";

import { db } from "@/shared/lib/db";
import { products, inventory } from "@/shared/lib/db/schema";
import {
  createProductSchema,
  updateProductSchema,
  adjustStockSchema,
  toggleProductActiveSchema,
} from "./schemas";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

type ActionResult = { error?: string; success?: string };

export async function createProductAction(
  _prevState: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  const raw = Object.fromEntries(formData);
  const parsed = createProductSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  if (parsed.data.sku) {
    const existing = await db.query.products.findFirst({
      where: eq(products.sku, parsed.data.sku),
    });
    if (existing) return { error: "A product with this SKU already exists." };
  }

  await db.transaction(async (tx) => {
    const [product] = await tx
      .insert(products)
      .values({
        name: parsed.data.name,
        sku: parsed.data.sku || null,
        description: parsed.data.description || null,
        category: parsed.data.category,
        unit: parsed.data.unit,
        price: parsed.data.price,
      })
      .returning({ id: products.id });

    await tx.insert(inventory).values({
      productId: product.id,
      quantityOnHand: 0,
      lowStockThreshold: parsed.data.lowStockThreshold
        ? parseInt(parsed.data.lowStockThreshold)
        : 10,
    });
  });

  revalidatePath("/inventory");
  return { success: "Product added successfully." };
}

export async function updateProductAction(
  _prevState: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  const raw = Object.fromEntries(formData);
  const parsed = updateProductSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  if (parsed.data.sku) {
    const existing = await db.query.products.findFirst({
      where: eq(products.sku, parsed.data.sku),
    });
    if (existing && existing.id !== parsed.data.id) {
      return { error: "A product with this SKU already exists." };
    }
  }

  await db
    .update(products)
    .set({
      name: parsed.data.name,
      sku: parsed.data.sku || null,
      description: parsed.data.description || null,
      category: parsed.data.category,
      unit: parsed.data.unit,
      price: parsed.data.price,
      updatedAt: new Date(),
    })
    .where(eq(products.id, parsed.data.id));

  revalidatePath("/inventory");
  return { success: "Product updated successfully." };
}

export async function toggleProductActiveAction(
  _prevState: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  const raw = Object.fromEntries(formData);
  const parsed = toggleProductActiveSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await db
    .update(products)
    .set({ isActive: !parsed.data.isActive, updatedAt: new Date() })
    .where(eq(products.id, parsed.data.id));

  revalidatePath("/inventory");
  return {
    success: parsed.data.isActive
      ? "Product archived successfully."
      : "Product restored successfully.",
  };
}

export async function adjustStockAction(
  _prevState: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  const raw = Object.fromEntries(formData);
  const parsed = adjustStockSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const newQty = parseInt(parsed.data.quantityOnHand);
  const threshold = parseInt(parsed.data.lowStockThreshold);

  const current = await db.query.inventory.findFirst({
    where: eq(inventory.id, parsed.data.inventoryId),
  });

  await db
    .update(inventory)
    .set({
      quantityOnHand: newQty,
      lowStockThreshold: threshold,
      lastRestockedAt:
        current && newQty > current.quantityOnHand ? new Date() : undefined,
      updatedAt: new Date(),
    })
    .where(eq(inventory.id, parsed.data.inventoryId));

  revalidatePath("/inventory");
  return { success: "Stock updated successfully." };
}
