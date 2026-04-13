import { db } from "@/shared/lib/db";
import {
  appointments,
  customers,
  services,
  users,
} from "@/shared/lib/db/schema";
import { alias } from "drizzle-orm/pg-core";
import { desc, eq } from "drizzle-orm";
import { auth } from "@/shared/lib/auth";
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
  createdAt: Date;
};

export async function AppointmentsTable() {
  const session = await auth();
  const userRole = session?.user?.role ?? "staff";

  const staffAlias = alias(users, "staff_users");

  const rows = await db
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
      createdAt: appointments.createdAt,
    })
    .from(appointments)
    .innerJoin(customers, eq(appointments.customerId, customers.id))
    .leftJoin(services, eq(appointments.serviceId, services.id))
    .leftJoin(staffAlias, eq(appointments.staffId, staffAlias.id))
    .orderBy(desc(appointments.scheduledAt));

  const data: AppointmentRow[] = rows.map((r) => ({
    ...r,
    serviceName: r.serviceName ?? null,
    servicePrice: r.servicePrice ?? null,
    staffId: r.staffId ?? null,
    staffName: r.staffName ?? null,
  }));

  const allCustomers = await db
    .select({ id: customers.id, name: customers.name, phone: customers.phone })
    .from(customers)
    .orderBy(customers.name);

  const activeServices = await db
    .select({
      id: services.id,
      name: services.name,
      price: services.price,
      duration: services.duration,
    })
    .from(services)
    .where(eq(services.isActive, true))
    .orderBy(services.name);

  const staffList = await db
    .select({ id: users.id, name: users.name })
    .from(users)
    .where(eq(users.isActive, true))
    .orderBy(users.name);

  return (
    <AppointmentsTableClient
      initialData={data}
      customers={allCustomers}
      servicesList={activeServices}
      staffList={staffList}
      userRole={userRole as "administrator" | "staff"}
    />
  );
}
