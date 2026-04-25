import { db } from "@/shared/lib/db";
import { requests, customers, products, users } from "@/shared/lib/db/schema";
import { alias } from "drizzle-orm/pg-core";
import { desc, eq, and, or, ilike, sql } from "drizzle-orm";
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
  status:
    | "pending"
    | "approved"
    | "out_for_delivery"
    | "rejected"
    | "fulfilled";
  rejectionReason: string | null;
  handlerName: string | null;
  deliveryType: "pickup" | "delivery" | null;
  deliveryAddress: string | null;
  deliveryDate: string | null;
  driverName: string | null;
  smsNotified: boolean;
};

const PAGE_SIZE = 10;

export async function RequestsTable({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const session = await auth();
  const userRole = session?.user?.role ?? "staff";

  const page = Math.max(1, Number(searchParams.page ?? 1));
  const search = searchParams.search?.trim() ?? "";
  const status = searchParams.status ?? "all";
  const offset = (page - 1) * PAGE_SIZE;

  const handlers = alias(users, "handlers");
  const drivers = alias(users, "drivers");

  const conditions = [];
  if (search)
    conditions.push(
      or(
        ilike(requests.requestNumber, `%${search}%`),
        ilike(customers.name, `%${search}%`),
      ),
    );
  if (status !== "all")
    conditions.push(
      eq(
        requests.status,
        status as
          | "pending"
          | "approved"
          | "out_for_delivery"
          | "rejected"
          | "fulfilled",
      ),
    );

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, countResult, allCustomers, activeProducts, staffList] =
    await Promise.all([
      db
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
        .where(where)
        .orderBy(desc(requests.createdAt))
        .limit(PAGE_SIZE)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(requests)
        .innerJoin(customers, eq(requests.customerId, customers.id))
        .where(where),
      db
        .select({
          id: customers.id,
          name: customers.name,
          phone: customers.phone,
        })
        .from(customers)
        .orderBy(customers.name),
      db
        .select({ id: products.id, name: products.name, sku: products.sku })
        .from(products)
        .where(eq(products.isActive, true))
        .orderBy(products.name),
      db
        .select({ id: users.id, name: users.name })
        .from(users)
        .where(eq(users.isActive, true))
        .orderBy(users.name),
    ]);

  const data: RequestRow[] = rows.map((r) => ({
    ...r,
    productName: r.productName ?? null,
    handlerName: r.handlerName ?? null,
    deliveryType: r.deliveryType ?? null,
    deliveryAddress: r.deliveryAddress ?? null,
    deliveryDate: r.deliveryDate ?? null,
    driverName: r.driverName ?? null,
  }));

  return (
    <RequestsTableClient
      data={data}
      totalCount={Number(countResult[0]?.count ?? 0)}
      page={page}
      pageSize={PAGE_SIZE}
      search={search}
      status={status}
      customers={allCustomers}
      products={activeProducts}
      staffList={staffList}
      userRole={userRole as "administrator" | "staff"}
    />
  );
}
