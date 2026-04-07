"use server";

import { db } from "@/shared/lib/db";
import {
  salesTransactions,
  salesTransactionItems,
  inventory,
  customers,
  users,
} from "@/shared/lib/db/schema";
import { completeSaleSchema, voidSaleSchema, markCreditPaymentSchema } from "./schemas";
import { auth } from "@/shared/lib/auth";
import { eq, sql, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { sendSMS } from "@/shared/lib/sms";

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

  const { cartJson: items, customerId, discountAmount, paymentMethod, amountTendered, notes, dueDate } = parsed.data;

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
      amountPaid: paymentMethod === "credit" ? "0.00" : total.toFixed(2),
      dueDate: paymentMethod === "credit" && dueDate ? dueDate : null,
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

  // SMS: receipt confirmation to customer
  if (customerId) {
    const customer = await db.query.customers.findFirst({
      where: eq(customers.id, customerId),
      columns: { phone: true, name: true },
    });
    if (customer?.phone) {
      await sendSMS(
        customer.phone,
        `Hi ${customer.name}! Your purchase of P${total.toFixed(2)} (Ref: ${transactionNumber}) at ADS Paint Center has been completed. Thank you!`
      );
    }
  }

  // SMS: alert admins for any item that dropped to/below its low-stock threshold
  const admins = await db.query.users.findMany({
    where: and(eq(users.role, "administrator"), eq(users.isActive, true)),
    columns: { phone: true },
  });
  const adminPhones = admins.map((a) => a.phone).filter(Boolean) as string[];

  if (adminPhones.length > 0) {
    for (const item of items) {
      const inv = await db.query.inventory.findFirst({
        where: eq(inventory.productId, item.productId),
        with: { product: { columns: { name: true, unit: true } } },
      });
      if (inv && inv.quantityOnHand <= inv.lowStockThreshold) {
        for (const phone of adminPhones) {
          await sendSMS(
            phone,
            `[ADS Paint Center] Low stock alert: "${inv.product.name}" now has ${inv.quantityOnHand} ${inv.product.unit}(s) remaining (threshold: ${inv.lowStockThreshold}).`
          );
        }
      }
    }
  }

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

export async function markCreditPaymentAction(
  _prevState: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };
  if (session.user.role !== "administrator") {
    return { error: "Only administrators can record credit payments." };
  }

  const raw = Object.fromEntries(formData);
  const parsed = markCreditPaymentSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const txn = await db.query.salesTransactions.findFirst({
    where: eq(salesTransactions.id, parsed.data.transactionId),
  });

  if (!txn) return { error: "Transaction not found." };
  if (txn.status === "voided") return { error: "Cannot record payment on a voided transaction." };
  if (txn.paymentMethod !== "credit") {
    return { error: "This transaction is not a credit sale." };
  }

  const currentPaid = parseFloat(txn.amountPaid ?? "0");
  const total = parseFloat(txn.totalAmount);
  const payment = parseFloat(parsed.data.paymentAmount);
  const newPaid = Math.min(currentPaid + payment, total);

  await db
    .update(salesTransactions)
    .set({ amountPaid: newPaid.toFixed(2) })
    .where(eq(salesTransactions.id, txn.id));

  revalidatePath("/sales");
  revalidatePath(`/sales/${txn.id}`);

  const balance = total - newPaid;
  return {
    success:
      balance <= 0
        ? `Payment recorded. Transaction ${txn.transactionNumber} is now fully paid.`
        : `Payment of ₱${payment.toFixed(2)} recorded. Remaining balance: ₱${balance.toFixed(2)}.`,
  };
}
