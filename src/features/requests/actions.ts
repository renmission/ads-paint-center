"use server";

import { db } from "@/shared/lib/db";
import { requests, customers, users } from "@/shared/lib/db/schema";
import { createRequestSchema, handleRequestSchema } from "./schemas";
import { auth } from "@/shared/lib/auth";
import { eq, sql, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { sendSMS } from "@/shared/lib/sms";

type ActionResult = { error?: string; success?: string };

export async function createRequestAction(
  _prevState: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const raw = Object.fromEntries(formData);
  const parsed = createRequestSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(requests)
    .where(sql`DATE(created_at) = CURRENT_DATE`);
  const seq = (Number(countResult[0].count) + 1).toString().padStart(4, "0");
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const requestNumber = `REQ-${dateStr}-${seq}`;

  await db.insert(requests).values({
    requestNumber,
    customerId: parsed.data.customerId,
    productId: parsed.data.productId || null,
    productDescription: parsed.data.productDescription || null,
    quantityRequested: parseInt(parsed.data.quantityRequested),
    status: "pending",
    smsNotified: false,
  });

  revalidatePath("/requests");

  // SMS: alert all active administrators about the new request
  const admins = await db.query.users.findMany({
    where: and(eq(users.role, "administrator"), eq(users.isActive, true)),
    columns: { phone: true },
  });
  for (const admin of admins) {
    if (admin.phone) {
      await sendSMS(
        admin.phone,
        `[ADS Paint Center] New product request ${requestNumber} has been submitted and is awaiting your review.`
      );
    }
  }

  return { success: `Request ${requestNumber} submitted successfully.` };
}

export async function handleRequestAction(
  _prevState: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };
  if (session.user.role !== "administrator") {
    return { error: "Only administrators can approve, reject, or fulfill requests." };
  }

  const raw = Object.fromEntries(formData);
  const parsed = handleRequestSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const request = await db.query.requests.findFirst({
    where: eq(requests.id, parsed.data.id),
  });

  if (!request) return { error: "Request not found." };

  // Validate status transition
  if (parsed.data.action === "approve" || parsed.data.action === "reject") {
    if (request.status !== "pending") {
      return { error: "Only pending requests can be approved or rejected." };
    }
  }
  if (parsed.data.action === "fulfill") {
    if (request.status !== "approved") {
      return { error: "Only approved requests can be marked as fulfilled." };
    }
  }

  const newStatus =
    parsed.data.action === "approve"
      ? "approved"
      : parsed.data.action === "reject"
        ? "rejected"
        : "fulfilled";

  const shouldNotify = newStatus === "approved" || newStatus === "fulfilled";

  await db
    .update(requests)
    .set({
      status: newStatus,
      handledBy: session.user.id!,
      rejectionReason:
        parsed.data.action === "reject" ? parsed.data.rejectionReason : null,
      smsNotified: shouldNotify,
      updatedAt: new Date(),
    })
    .where(eq(requests.id, parsed.data.id));

  // SMS: notify customer when their request is approved or fulfilled
  if (shouldNotify) {
    const customer = await db.query.customers.findFirst({
      where: eq(customers.id, request.customerId),
      columns: { phone: true, name: true },
    });
    if (customer?.phone) {
      const message =
        newStatus === "approved"
          ? `Hi ${customer.name}! Your product request (${request.requestNumber}) at ADS Paint Center has been approved. Our staff will prepare your order.`
          : `Hi ${customer.name}! Your requested item (${request.requestNumber}) is now ready for pickup at ADS Paint Center. Please visit us during store hours.`;
      await sendSMS(customer.phone, message);
    }
  }

  revalidatePath("/requests");
  const label =
    parsed.data.action === "approve"
      ? "approved"
      : parsed.data.action === "reject"
        ? "rejected"
        : "marked as fulfilled";
  return { success: `Request ${request.requestNumber} ${label}.` };
}
