"use server";

import { db } from "@/shared/lib/db";
import {
  salesTransactions,
  salesTransactionItems,
  inventory,
} from "@/shared/lib/db/schema";
import { completeSaleSchema, voidSaleSchema } from "./schemas";
import { auth } from "@/shared/lib/auth";
import { eq, sql, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

type ActionResult = { error?: string; success?: string };

export async function completeSaleAction(
  _prevState: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const raw = Object.fromEntries(formData);
  const parsed = completeSaleSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { cartJson: items, customerId, discountAmount, paymentMethod, amountTendered, notes } = parsed.data;

  // Validate stock for all items before writing anything
  for (const item of items) {
    const inv = await db.query.inventory.findFirst({
      where: eq(inventory.productId, item.productId),
    });
    if (!inv) return { error: `Inventory record not found for "${item.productName}".` };
    if (inv.quantityOnHand < item.quantity) {
      return {
        error: `Insufficient stock for "${item.productName}". Available: ${inv.quantityOnHand}, requested: ${item.quantity}.`,
      };
    }
  }

  const discount = parseFloat(discountAmount);
  const tendered = parseFloat(amountTendered);
  const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0);
  const total = Math.max(0, subtotal - discount);
  const change = paymentMethod === "cash" ? Math.max(0, tendered - total) : 0;

  // Generate transaction number based on today's count
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(salesTransactions)
    .where(sql`DATE(created_at) = CURRENT_DATE`);
  const seq = (Number(countResult[0].count) + 1).toString().padStart(4, "0");
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const transactionNumber = `TXN-${dateStr}-${seq}`;

  const [txn] = await db
    .insert(salesTransactions)
    .values({
      transactionNumber,
      customerId: customerId || null,
      staffId: session.user!.id!,
      subtotal: subtotal.toFixed(2),
      discountAmount: discount.toFixed(2),
      totalAmount: total.toFixed(2),
      amountTendered: tendered.toFixed(2),
      changeAmount: change.toFixed(2),
      paymentMethod,
      status: "completed",
      notes: notes || null,
    })
    .returning({ id: salesTransactions.id });

  await db.insert(salesTransactionItems).values(
    items.map((item) => ({
      transactionId: txn.id,
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.unitPrice.toFixed(2),
      lineTotal: item.lineTotal.toFixed(2),
    }))
  );

  // Deduct inventory for each item
  for (const item of items) {
    await db
      .update(inventory)
      .set({
        quantityOnHand: sql`quantity_on_hand - ${item.quantity}`,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(inventory.productId, item.productId),
          sql`quantity_on_hand >= ${item.quantity}`
        )
      );
  }

  revalidatePath("/sales");
  revalidatePath("/inventory");
  return { success: `Sale ${transactionNumber} completed successfully.` };
}

export async function voidSaleAction(
  _prevState: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };
  if (session.user.role !== "administrator") {
    return { error: "Only administrators can void sales." };
  }

  const raw = Object.fromEntries(formData);
  const parsed = voidSaleSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const txn = await db.query.salesTransactions.findFirst({
    where: eq(salesTransactions.id, parsed.data.transactionId),
    with: { items: true },
  });

  if (!txn) return { error: "Transaction not found." };
  if (txn.status === "voided") return { error: "Transaction is already voided." };

  await db
    .update(salesTransactions)
    .set({ status: "voided" })
    .where(eq(salesTransactions.id, txn.id));

  // Restore inventory
  for (const item of txn.items) {
    await db
      .update(inventory)
      .set({
        quantityOnHand: sql`quantity_on_hand + ${item.quantity}`,
        updatedAt: new Date(),
      })
      .where(eq(inventory.productId, item.productId));
  }

  revalidatePath("/sales");
  revalidatePath("/inventory");
  return { success: `Transaction ${txn.transactionNumber} voided and inventory restored.` };
}
