import { db } from "@/shared/lib/db";
import {
  appointments,
  customers,
  services,
  users,
} from "@/shared/lib/db/schema";
import { alias } from "drizzle-orm/pg-core";
import { desc, eq, and, or, ilike, sql } from "drizzle-orm";
import { AppointmentsTableClient } from "./appointments-table-client";

export type AppointmentRow = {
  id: string;
  appointmentNumber: string;
  scheduledAt: Date;
  status: "scheduled" | "confirmed" | "in_progress" | "completed" | "cancelled";
  customerName: string;
  customerPhone: string;
  serviceName: string | null;
  servicePrice: string | null;
  staffId: string | null;
  staffName: string | null;
  notes: string | null;
  address: string | null;
  downpaymentAmount: string | null;
  downpaymentPaid: string | null;
  downpaymentMethod: "cash" | "gcash" | "credit" | "other" | null;
  downpaymentPaidAt: Date | null;
  createdAt: Date;
};

const PAGE_SIZE = 10;

export async function AppointmentsTable({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const page = Math.max(1, Number(searchParams.page ?? 1));
  const search = searchParams.search?.trim() ?? "";
  const status = searchParams.status ?? "all";
  const offset = (page - 1) * PAGE_SIZE;

  const staffAlias = alias(users, "staff_users");

  const conditions = [];
  if (search)
    conditions.push(
      or(
        ilike(appointments.appointmentNumber, `%${search}%`),
        ilike(customers.name, `%${search}%`),
        ilike(services.name, `%${search}%`),
      ),
    );
  if (status !== "all")
    conditions.push(
      eq(
        appointments.status,
        status as
          | "scheduled"
          | "confirmed"
          | "in_progress"
          | "completed"
          | "cancelled",
      ),
    );

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, countResult, allCustomers, activeServices, staffList] =
    await Promise.all([
      db
        .select({
          id: appointments.id,
          appointmentNumber: appointments.appointmentNumber,
          scheduledAt: appointments.scheduledAt,
          status: appointments.status,
          customerName: customers.name,
          customerPhone: customers.phone,
          serviceName: services.name,
          servicePrice: services.price,
          staffId: appointments.staffId,
          staffName: staffAlias.name,
          notes: appointments.notes,
          address: appointments.address,
          downpaymentAmount: appointments.downpaymentAmount,
          downpaymentPaid: appointments.downpaymentPaid,
          downpaymentMethod: appointments.downpaymentMethod,
          downpaymentPaidAt: appointments.downpaymentPaidAt,
          createdAt: appointments.createdAt,
        })
        .from(appointments)
        .innerJoin(customers, eq(appointments.customerId, customers.id))
        .leftJoin(services, eq(appointments.serviceId, services.id))
        .leftJoin(staffAlias, eq(appointments.staffId, staffAlias.id))
        .where(where)
        .orderBy(desc(appointments.scheduledAt))
        .limit(PAGE_SIZE)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(appointments)
        .innerJoin(customers, eq(appointments.customerId, customers.id))
        .leftJoin(services, eq(appointments.serviceId, services.id))
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
    ]);

  const data: AppointmentRow[] = rows.map((r) => ({
    ...r,
    serviceName: r.serviceName ?? null,
    servicePrice: r.servicePrice ?? null,
    staffId: r.staffId ?? null,
    staffName: r.staffName ?? null,
    downpaymentAmount: r.downpaymentAmount ?? null,
    downpaymentPaid: r.downpaymentPaid ?? null,
    downpaymentMethod: r.downpaymentMethod ?? null,
    downpaymentPaidAt: r.downpaymentPaidAt ?? null,
  }));

  return (
    <AppointmentsTableClient
      data={data}
      totalCount={Number(countResult[0]?.count ?? 0)}
      page={page}
      pageSize={PAGE_SIZE}
      search={search}
      status={status}
      customers={allCustomers}
      servicesList={activeServices}
      staffList={staffList}
    />
  );
}
