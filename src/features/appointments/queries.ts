import { db } from "@/shared/lib/db";
import { appointments, customers } from "@/shared/lib/db/schema";
import { and, eq, gte, inArray, isNull, lte } from "drizzle-orm";

export type ReminderCandidate = {
  id: string;
  appointmentNumber: string;
  scheduledAt: Date;
  customerName: string;
  customerPhone: string;
};

/**
 * Returns appointments scheduled between now+23h and now+25h
 * that have not yet received a reminder and are in an active status.
 */
export async function getAppointmentsDueForReminder(): Promise<
  ReminderCandidate[]
> {
  const now = new Date();
  const windowStart = new Date(now.getTime() + 23 * 60 * 60 * 1000);
  const windowEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000);

  return db
    .select({
      id: appointments.id,
      appointmentNumber: appointments.appointmentNumber,
      scheduledAt: appointments.scheduledAt,
      customerName: customers.name,
      customerPhone: customers.phone,
    })
    .from(appointments)
    .innerJoin(customers, eq(appointments.customerId, customers.id))
    .where(
      and(
        gte(appointments.scheduledAt, windowStart),
        lte(appointments.scheduledAt, windowEnd),
        isNull(appointments.remindedAt),
        inArray(appointments.status, ["scheduled", "confirmed"]),
      ),
    );
}

/**
 * Stamps the remindedAt timestamp on a single appointment.
 * Called immediately after sendSMS so partial failures don't suppress
 * future reminder attempts for other appointments.
 */
export async function markAppointmentReminded(
  appointmentId: string,
): Promise<void> {
  await db
    .update(appointments)
    .set({ remindedAt: new Date(), updatedAt: new Date() })
    .where(eq(appointments.id, appointmentId));
}
