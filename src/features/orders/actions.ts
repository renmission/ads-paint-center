"use server";

import { db } from "@/shared/lib/db";
import { orders, orderItems, customers, users } from "@/shared/lib/db/schema";
import { placeOrderSchema, handleOrderSchema, cartItemSchema } from "./schemas";
import { auth } from "@/shared/lib/auth";
import { eq, sql, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { sendSMS } from "@/shared/lib/sms";
import { getOrderDetail, type OrderDetail } from "./queries";

export async function fetchOrderDetailAction(
  id: string,
): Promise<{ data?: OrderDetail; error?: string }> {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const detail = await getOrderDetail(id);
  if (!detail) return { error: "Order not found." };
  return { data: detail };
}

type ActionResult = { error?: string; success?: string; orderId?: string };

export async function placeOrderAction(
  _prevState: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const raw = Object.fromEntries(formData);
  const parsed = placeOrderSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const cartParsed = (() => {
    try {
      return JSON.parse(parsed.data.cartJson) as unknown[];
    } catch {
      return null;
    }
  })();
  if (!Array.isArray(cartParsed) || cartParsed.length === 0) {
    return { error: "Cart is empty." };
  }

  const itemsResult = cartParsed.map((item) => cartItemSchema.safeParse(item));
  if (itemsResult.some((r) => !r.success)) {
    return { error: "Invalid cart data." };
  }
  const items = itemsResult.map(
    (r) =>
      (r as { success: true; data: ReturnType<typeof cartItemSchema.parse> })
        .data,
  );

  const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0);
  const totalAmount = subtotal;

  // Generate order number
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(orders)
    .where(sql`DATE(created_at) = CURRENT_DATE`);
  const seq = (Number(countResult[0].count) + 1).toString().padStart(4, "0");
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const orderNumber = `ORD-${dateStr}-${seq}`;

  // Find or create customer record by phone
  let customerId: string | null = null;
  const existingCustomer = await db.query.customers.findFirst({
    where: eq(customers.phone, parsed.data.customerPhone),
    columns: { id: true },
  });
  if (existingCustomer) {
    customerId = existingCustomer.id;
  } else {
    const [newCustomer] = await db
      .insert(customers)
      .values({
        name: parsed.data.customerName,
        phone: parsed.data.customerPhone,
        email: parsed.data.customerEmail || null,
      })
      .returning({ id: customers.id });
    customerId = newCustomer.id;
  }

  const [order] = await db
    .insert(orders)
    .values({
      orderNumber,
      customerName: parsed.data.customerName,
      customerPhone: parsed.data.customerPhone,
      customerEmail: parsed.data.customerEmail || null,
      customerId,
      subtotal: subtotal.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
      deliveryType: parsed.data.deliveryType,
      deliveryAddress: parsed.data.deliveryAddress || null,
      paymentMethod: parsed.data.paymentMethod as "cash" | "gcash" | "other",
      notes: parsed.data.notes || null,
      status: "pending",
      paymentStatus: "unpaid",
    })
    .returning({ id: orders.id });

  await db.insert(orderItems).values(
    items.map((item) => ({
      orderId: order.id,
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.unitPrice.toFixed(2),
      lineTotal: item.lineTotal.toFixed(2),
    })),
  );

  revalidatePath("/dashboard/orders");

  // SMS: alert admins of new online order
  const admins = await db.query.users.findMany({
    where: and(eq(users.role, "administrator"), eq(users.isActive, true)),
    columns: { phone: true },
  });
  for (const admin of admins) {
    if (admin.phone) {
      await sendSMS(
        admin.phone,
        `[ADS Paint Center] New online order ${orderNumber} from ${parsed.data.customerName} (${parsed.data.customerPhone}) — ${parsed.data.deliveryType}. Total: ₱${totalAmount.toFixed(2)}.`,
      );
    }
  }

  // SMS: confirmation to customer
  await sendSMS(
    parsed.data.customerPhone,
    `Hi ${parsed.data.customerName}! Your order ${orderNumber} at ADS Paint Center has been received. Total: ₱${totalAmount.toFixed(2)}. We will confirm it shortly.`,
  );

  return {
    success: `Order ${orderNumber} placed successfully.`,
    orderId: order.id,
  };
}

export async function handleOrderAction(
  _prevState: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };
  if (session.user.role !== "administrator") {
    return { error: "Only administrators can manage orders." };
  }

  const raw = Object.fromEntries(formData);
  const parsed = handleOrderSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const order = await db.query.orders.findFirst({
    where: eq(orders.id, parsed.data.id),
  });
  if (!order) return { error: "Order not found." };

  const { action } = parsed.data;

  if (action === "confirm" && order.status !== "pending") {
    return { error: "Only pending orders can be confirmed." };
  }
  if (action === "fulfil" && order.status !== "confirmed") {
    return { error: "Only confirmed orders can be fulfilled." };
  }
  if (
    action === "cancel" &&
    (order.status === "fulfilled" || order.status === "cancelled")
  ) {
    return { error: "This order cannot be cancelled." };
  }

  const newStatus =
    action === "confirm"
      ? "confirmed"
      : action === "fulfil"
        ? "fulfilled"
        : action === "cancel"
          ? "cancelled"
          : order.status;

  const newPaymentStatus =
    action === "mark_paid" ? "paid" : order.paymentStatus;

  await db
    .update(orders)
    .set({
      status: newStatus,
      paymentStatus: newPaymentStatus,
      handledBy: session.user.id!,
      notes: parsed.data.notes ?? order.notes,
      updatedAt: new Date(),
    })
    .where(eq(orders.id, parsed.data.id));

  revalidatePath("/dashboard/orders");

  // SMS to customer on status changes
  let message: string | null = null;
  if (action === "confirm") {
    message =
      order.deliveryType === "delivery"
        ? `Hi ${order.customerName}! Your order ${order.orderNumber} at ADS Paint Center has been confirmed and will be delivered to you.`
        : `Hi ${order.customerName}! Your order ${order.orderNumber} at ADS Paint Center has been confirmed and is ready for pickup.`;
  } else if (action === "fulfil") {
    message =
      order.deliveryType === "delivery"
        ? `Hi ${order.customerName}! Your order ${order.orderNumber} from ADS Paint Center has been delivered. Thank you!`
        : `Hi ${order.customerName}! Your order ${order.orderNumber} is ready for pickup at ADS Paint Center. Please visit us during store hours.`;
  } else if (action === "cancel") {
    message = `Hi ${order.customerName}! Unfortunately, your order ${order.orderNumber} at ADS Paint Center has been cancelled. Please contact us for more information.`;
  }

  if (message) await sendSMS(order.customerPhone, message);

  const label =
    action === "confirm"
      ? "confirmed"
      : action === "fulfil"
        ? "fulfilled"
        : action === "cancel"
          ? "cancelled"
          : "updated";

  return { success: `Order ${order.orderNumber} ${label}.` };
}
