import { db } from "@/shared/lib/db";
import { requests, customers, products, users } from "@/shared/lib/db/schema";
import { alias } from "drizzle-orm/pg-core";
import { desc, eq } from "drizzle-orm";
import { auth } from "@/shared/lib/auth";
import { RequestsTableClient } from "./requests-table-client";

export type RequestRow = {
  id: string;
  requestNumber: string;
  createdAt: Date;
  updatedAt: Date;
  customerName: string;
  customerPhone: string;
  productName: string | null;
  productDescription: string | null;
  quantityRequested: number;
  status: "pending" | "approved" | "out_for_delivery" | "rejected" | "fulfilled";
  rejectionReason: string | null;
  handlerName: string | null;
  deliveryType: "pickup" | "delivery" | null;
  deliveryAddress: string | null;
  deliveryDate: string | null;
  driverName: string | null;
  smsNotified: boolean;
};

export async function RequestsTable() {
  const session = await auth();
  const userRole = session?.user?.role ?? "staff";

  const handlers = alias(users, "handlers");
  const drivers = alias(users, "drivers");

  const rows = await db
    .select({
      id: requests.id,
      requestNumber: requests.requestNumber,
      createdAt: requests.createdAt,
      updatedAt: requests.updatedAt,
      customerName: customers.name,
      customerPhone: customers.phone,
      productName: products.name,
      productDescription: requests.productDescription,
      quantityRequested: requests.quantityRequested,
      status: requests.status,
      rejectionReason: requests.rejectionReason,
      handlerName: handlers.name,
      deliveryType: requests.deliveryType,
      deliveryAddress: requests.deliveryAddress,
      deliveryDate: requests.deliveryDate,
      driverName: drivers.name,
      smsNotified: requests.smsNotified,
    })
    .from(requests)
    .innerJoin(customers, eq(requests.customerId, customers.id))
    .leftJoin(products, eq(requests.productId, products.id))
    .leftJoin(handlers, eq(requests.handledBy, handlers.id))
    .leftJoin(drivers, eq(requests.driverId, drivers.id))
    .orderBy(desc(requests.createdAt));

  const data: RequestRow[] = rows.map((r) => ({
    ...r,
    productName: r.productName ?? null,
    handlerName: r.handlerName ?? null,
    deliveryType: r.deliveryType ?? null,
    deliveryAddress: r.deliveryAddress ?? null,
    deliveryDate: r.deliveryDate ?? null,
    driverName: r.driverName ?? null,
  }));

  const allCustomers = await db
    .select({ id: customers.id, name: customers.name, phone: customers.phone })
    .from(customers)
    .orderBy(customers.name);

  const activeProducts = await db
    .select({ id: products.id, name: products.name, sku: products.sku })
    .from(products)
    .where(eq(products.isActive, true))
    .orderBy(products.name);

  const staffList = await db
    .select({ id: users.id, name: users.name })
    .from(users)
    .where(eq(users.isActive, true))
    .orderBy(users.name);

  return (
    <RequestsTableClient
      initialData={data}
      customers={allCustomers}
      products={activeProducts}
      staffList={staffList}
      userRole={userRole as "administrator" | "staff"}
    />
  );
}
