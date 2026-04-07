"use server";

import { db } from "@/shared/lib/db";
import { appointments, customers, services, users } from "@/shared/lib/db/schema";
import { createAppointmentSchema, updateAppointmentSchema } from "./schemas";
import { auth } from "@/shared/lib/auth";
import { eq, sql, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { sendSMS } from "@/shared/lib/sms";

type ActionResult = { error?: string; success?: string };

export async function createAppointmentAction(
  _prevState: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const raw = Object.fromEntries(formData);
  const parsed = createAppointmentSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(appointments)
    .where(sql`DATE(created_at) = CURRENT_DATE`);
  const seq = (Number(countResult[0].count) + 1).toString().padStart(4, "0");
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const appointmentNumber = `APT-${dateStr}-${seq}`;

  await db.insert(appointments).values({
    appointmentNumber,
    customerId: parsed.data.customerId,
    serviceId: parsed.data.serviceId || null,
    staffId: parsed.data.staffId || null,
    scheduledAt: new Date(parsed.data.scheduledAt),
    notes: parsed.data.notes || null,
    address: parsed.data.address || null,
    status: "scheduled",
  });

  revalidatePath("/appointments");

  // SMS: notify customer of their appointment
  const customer = await db.query.customers.findFirst({
    where: eq(customers.id, parsed.data.customerId),
    columns: { phone: true, name: true },
  });
  if (customer?.phone) {
    const scheduledDate = new Date(parsed.data.scheduledAt).toLocaleString("en-PH", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    let serviceName = "appointment";
    if (parsed.data.serviceId) {
      const svc = await db.query.services.findFirst({
        where: eq(services.id, parsed.data.serviceId),
        columns: { name: true },
      });
      if (svc) serviceName = svc.name;
    }

    try {
      await sendSMS(
        customer.phone,
        `Hi ${customer.name}! Your ${serviceName} appointment (${appointmentNumber}) at ADS Paint Center is scheduled for ${scheduledDate}. We look forward to seeing you!`
      );
    } catch (err) {
      console.error("SMS send failed:", err);
    }
  }

  return { success: `Appointment ${appointmentNumber} scheduled.` };
}

export async function updateAppointmentAction(
  _prevState: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const raw = Object.fromEntries(formData);
  const parsed = updateAppointmentSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const appointment = await db.query.appointments.findFirst({
    where: eq(appointments.id, parsed.data.id),
    with: { customer: { columns: { phone: true, name: true } } },
  });

  if (!appointment) return { error: "Appointment not found." };

  // Validate transitions
  const { action } = parsed.data;
  const validTransitions: Record<string, string[]> = {
    confirm: ["scheduled"],
    start: ["confirmed"],
    complete: ["in_progress", "confirmed"],
    cancel: ["scheduled", "confirmed"],
  };
  if (!validTransitions[action]?.includes(appointment.status)) {
    return { error: `Cannot ${action} an appointment with status "${appointment.status}".` };
  }

  const newStatus =
    action === "confirm" ? "confirmed" :
    action === "start" ? "in_progress" :
    action === "complete" ? "completed" : "cancelled";

  await db
    .update(appointments)
    .set({
      status: newStatus,
      staffId: parsed.data.staffId || null,
      notes: parsed.data.notes || null,
      updatedAt: new Date(),
    })
    .where(eq(appointments.id, parsed.data.id));

  revalidatePath("/appointments");

  // SMS on confirmation
  if (newStatus === "confirmed" && appointment.customer?.phone) {
    const scheduledDate = appointment.scheduledAt.toLocaleString("en-PH", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    try {
      await sendSMS(
        appointment.customer.phone,
        `Hi ${appointment.customer.name}! Your appointment (${appointment.appointmentNumber}) at ADS Paint Center on ${scheduledDate} has been confirmed. See you then!`
      );
    } catch (err) {
      console.error("SMS send failed:", err);
    }
  }

  const label =
    action === "confirm" ? "confirmed" :
    action === "start" ? "started" :
    action === "complete" ? "completed" : "cancelled";

  return { success: `Appointment ${appointment.appointmentNumber} ${label}.` };
}
