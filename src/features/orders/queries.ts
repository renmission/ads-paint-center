import { db } from "@/shared/lib/db";
import { orders, products, users } from "@/shared/lib/db/schema";
import { desc, eq, or, ilike, sql } from "drizzle-orm";

export type OrderRow = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  deliveryType: "pickup" | "delivery";
  deliveryAddress: string | null;
  paymentMethod: "cash" | "gcash" | "credit" | "other";
  status: "pending" | "confirmed" | "fulfilled" | "cancelled";
  paymentStatus: "unpaid" | "paid";
  subtotal: string;
  totalAmount: string;
  notes: string | null;
  handlerName: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type OrderDetail = OrderRow & {
  items: {
    id: string;
    productName: string;
    quantity: number;
    unitPrice: string;
    lineTotal: string;
  }[];
};

const PAGE_SIZE = 10;

export async function getOrders(params: {
  page: number;
  search: string;
}): Promise<{ data: OrderRow[]; totalCount: number }> {
  const offset = (params.page - 1) * PAGE_SIZE;

  const where = params.search
    ? or(
        ilike(orders.orderNumber, `%${params.search}%`),
        ilike(orders.customerName, `%${params.search}%`),
        ilike(orders.customerPhone, `%${params.search}%`),
      )
    : undefined;

  const [rows, countResult] = await Promise.all([
    db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        customerName: orders.customerName,
        customerPhone: orders.customerPhone,
        customerEmail: orders.customerEmail,
        deliveryType: orders.deliveryType,
        deliveryAddress: orders.deliveryAddress,
        paymentMethod: orders.paymentMethod,
        status: orders.status,
        paymentStatus: orders.paymentStatus,
        subtotal: orders.subtotal,
        totalAmount: orders.totalAmount,
        notes: orders.notes,
        handlerName: users.name,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
      })
      .from(orders)
      .leftJoin(users, eq(orders.handledBy, users.id))
      .where(where)
      .orderBy(desc(orders.createdAt))
      .limit(PAGE_SIZE)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(where),
  ]);

  const data: OrderRow[] = rows.map((r) => ({
    ...r,
    handlerName: r.handlerName ?? null,
    deliveryAddress: r.deliveryAddress ?? null,
    customerEmail: r.customerEmail ?? null,
    notes: r.notes ?? null,
  }));

  return { data, totalCount: Number(countResult[0]?.count ?? 0) };
}

export async function getOrderDetail(id: string): Promise<OrderDetail | null> {
  const order = await db.query.orders.findFirst({
    where: eq(orders.id, id),
    with: {
      handler: { columns: { name: true } },
      items: {
        with: { product: { columns: { name: true } } },
      },
    },
  });

  if (!order) return null;

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    customerEmail: order.customerEmail,
    deliveryType: order.deliveryType,
    deliveryAddress: order.deliveryAddress,
    paymentMethod: order.paymentMethod,
    status: order.status,
    paymentStatus: order.paymentStatus,
    subtotal: order.subtotal,
    totalAmount: order.totalAmount,
    notes: order.notes,
    handlerName: order.handler?.name ?? null,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    items: order.items.map((item) => ({
      id: item.id,
      productName: item.product.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineTotal: item.lineTotal,
    })),
  };
}

export async function getShopProducts() {
  return db
    .select({
      id: products.id,
      name: products.name,
      sku: products.sku,
      imageUrl: products.imageUrl,
      description: products.description,
      category: products.category,
      unit: products.unit,
      price: products.price,
    })
    .from(products)
    .where(eq(products.isActive, true))
    .orderBy(products.category, products.name);
}
