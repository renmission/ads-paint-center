import { type NextRequest } from "next/server";

import {
  getAppointmentsDueForReminder,
  markAppointmentReminded,
} from "@/features/appointments/queries";
import { sendSMS } from "@/shared/lib/sms";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json(
      {
        error: {
          code: "UNAUTHORIZED",
          message: "Invalid or missing cron secret.",
        },
      },
      { status: 401 },
    );
  }

  const candidates = await getAppointmentsDueForReminder();
  let sent = 0;
  let errors = 0;

  for (const appt of candidates) {
    const scheduledDate = appt.scheduledAt.toLocaleString("en-PH", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const message =
      `Hi ${appt.customerName}! This is a reminder that your appointment ` +
      `(${appt.appointmentNumber}) at ADS Paint Center is tomorrow, ` +
      `${scheduledDate}. We look forward to seeing you!`;

    try {
      await sendSMS(appt.customerPhone, message);
      await markAppointmentReminded(appt.id);
      sent++;
    } catch (err) {
      console.error(
        `[cron/reminders] Failed for appointment ${appt.appointmentNumber}:`,
        err,
      );
      errors++;
    }
  }

  return Response.json({ sent, errors });
}
