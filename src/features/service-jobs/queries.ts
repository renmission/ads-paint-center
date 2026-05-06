import { db } from "@/shared/lib/db";
import {
  serviceJobs,
  customers,
  services,
  products,
  users,
} from "@/shared/lib/db/schema";
import { desc, eq, or, ilike, sql } from "drizzle-orm";

export type ServiceJobRow = {
  id: string;
  jobNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string | null;
  serviceName: string | null;
  servicePrice: string | null;
  scheduledAt: Date | null;
  status: "pending" | "scheduled" | "in_progress" | "completed" | "cancelled";
  totalAmount: string;
  address: string | null;
  handlerName: string | null;
  createdAt: Date;
};

export type ServiceJobItemDetail = {
  id: string;
  description: string;
  productName: string | null;
  quantity: number;
  unitPrice: string;
  lineTotal: string;
};

export type ServiceJobDetail = ServiceJobRow & {
  serviceId: string | null;
  servicePrice: string | null;
  customerEmail: string | null;
  notes: string | null;
  items: ServiceJobItemDetail[];
};

const PAGE_SIZE = 10;

export async function getServiceJobs(params: {
  page: number;
  search: string;
}): Promise<{ data: ServiceJobRow[]; totalCount: number }> {
  const offset = (params.page - 1) * PAGE_SIZE;

  const where = params.search
    ? or(
        ilike(serviceJobs.jobNumber, `%${params.search}%`),
        ilike(customers.name, `%${params.search}%`),
        ilike(customers.phone, `%${params.search}%`),
      )
    : undefined;

  const [rows, countResult] = await Promise.all([
    db
      .select({
        id: serviceJobs.id,
        jobNumber: serviceJobs.jobNumber,
        customerId: serviceJobs.customerId,
        customerName: customers.name,
        customerPhone: customers.phone,
        customerAddress: customers.address,
        serviceName: services.name,
        servicePrice: services.price,
        scheduledAt: serviceJobs.scheduledAt,
        status: serviceJobs.status,
        totalAmount: serviceJobs.totalAmount,
        address: serviceJobs.address,
        handlerName: users.name,
        createdAt: serviceJobs.createdAt,
      })
      .from(serviceJobs)
      .innerJoin(customers, eq(serviceJobs.customerId, customers.id))
      .leftJoin(services, eq(serviceJobs.serviceId, services.id))
      .leftJoin(users, eq(serviceJobs.handledBy, users.id))
      .where(where)
      .orderBy(desc(serviceJobs.createdAt))
      .limit(PAGE_SIZE)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(serviceJobs)
      .innerJoin(customers, eq(serviceJobs.customerId, customers.id))
      .where(where),
  ]);

  return {
    data: rows.map((r) => ({
      ...r,
      customerAddress: r.customerAddress ?? null,
      serviceName: r.serviceName ?? null,
      servicePrice: r.servicePrice ?? null,
      scheduledAt: r.scheduledAt ?? null,
      address: r.address ?? null,
      handlerName: r.handlerName ?? null,
    })),
    totalCount: Number(countResult[0]?.count ?? 0),
  };
}

export async function getServiceJobById(
  id: string,
): Promise<ServiceJobDetail | null> {
  const job = await db.query.serviceJobs.findFirst({
    where: eq(serviceJobs.id, id),
    with: {
      customer: { columns: { name: true, phone: true, email: true, address: true } },
      service: { columns: { name: true, price: true } },
      handler: { columns: { name: true } },
      items: {
        with: { product: { columns: { name: true } } },
      },
    },
  });

  if (!job) return null;

  return {
    id: job.id,
    jobNumber: job.jobNumber,
    customerId: job.customerId,
    customerName: job.customer.name,
    customerPhone: job.customer.phone,
    customerEmail: job.customer.email ?? null,
    customerAddress: job.customer.address ?? null,
    serviceId: job.serviceId ?? null,
    serviceName: job.service?.name ?? null,
    servicePrice: job.service?.price ?? null,
    scheduledAt: job.scheduledAt ?? null,
    status: job.status,
    totalAmount: job.totalAmount,
    address: job.address ?? null,
    handlerName: job.handler?.name ?? null,
    notes: job.notes ?? null,
    createdAt: job.createdAt,
    items: job.items.map((item) => ({
      id: item.id,
      description: item.description,
      productName: item.product?.name ?? null,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineTotal: item.lineTotal,
    })),
  };
}

export async function generateJobNumber(): Promise<string> {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(serviceJobs)
    .where(sql`DATE(created_at) = CURRENT_DATE`);
  const seq = (Number(countResult[0].count) + 1).toString().padStart(4, "0");
  return `SJ-${dateStr}-${seq}`;
}

export async function getFormOptions() {
  const [allCustomers, activeServices, staffList, activeProducts] =
    await Promise.all([
      db
        .select({
          id: customers.id,
          name: customers.name,
          phone: customers.phone,
          address: customers.address,
        })
        .from(customers)
        .orderBy(customers.name),
      db
        .select({
          id: services.id,
          name: services.name,
          price: services.price,
          duration: services.duration,
        })
        .from(services)
        .where(eq(services.isActive, true))
        .orderBy(services.name),
      db
        .select({ id: users.id, name: users.name })
        .from(users)
        .where(eq(users.isActive, true))
        .orderBy(users.name),
      db
        .select({ id: products.id, name: products.name, price: products.price, unit: products.unit })
        .from(products)
        .where(eq(products.isActive, true))
        .orderBy(products.name),
    ]);

  return { allCustomers, activeServices, staffList, activeProducts };
}
