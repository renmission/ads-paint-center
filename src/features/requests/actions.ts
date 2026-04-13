"use server";

import { db } from "@/shared/lib/db";
import { requests, users } from "@/shared/lib/db/schema";
import { createRequestSchema, handleRequestSchema } from "./schemas";
import { auth } from "@/shared/lib/auth";
import { eq, sql, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { sendSMS } from "@/shared/lib/sms";

type ActionResult = { error?: string; success?: string };

export async function createRequestAction(
  _prevState: ActionResult | undefined,
  formData: FormData,
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
    deliveryType: parsed.data.deliveryType ?? null,
    deliveryAddress: parsed.data.deliveryAddress || null,
    deliveryDate: parsed.data.deliveryDate || null,
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
        `[ADS Paint Center] New product request ${requestNumber} has been submitted and is awaiting your review.`,
      );
    }
  }

  return { success: `Request ${requestNumber} submitted successfully.` };
}

export async function handleRequestAction(
  _prevState: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };
  if (session.user.role !== "administrator") {
    return {
      error: "Only administrators can approve, reject, or fulfill requests.",
    };
  }

  const raw = Object.fromEntries(formData);
  const parsed = handleRequestSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const request = await db.query.requests.findFirst({
    where: eq(requests.id, parsed.data.id),
    with: { customer: { columns: { phone: true, name: true } } },
  });

  if (!request) return { error: "Request not found." };

  // Validate status transitions
  const { action } = parsed.data;
  if (action === "approve" || action === "reject") {
    if (request.status !== "pending") {
      return { error: "Only pending requests can be approved or rejected." };
    }
  }
  if (action === "mark_out_for_delivery") {
    if (request.status !== "approved") {
      return {
        error: "Only approved requests can be marked out for delivery.",
      };
    }
    if (request.deliveryType !== "delivery") {
      return { error: "This request is not a delivery order." };
    }
  }
  if (action === "fulfill") {
    if (
      request.status !== "approved" &&
      request.status !== "out_for_delivery"
    ) {
      return {
        error: "Only approved or out-for-delivery requests can be fulfilled.",
      };
    }
  }

  const newStatus =
    action === "approve"
      ? "approved"
      : action === "reject"
        ? "rejected"
        : action === "mark_out_for_delivery"
          ? "out_for_delivery"
          : "fulfilled";

  await db
    .update(requests)
    .set({
      status: newStatus,
      handledBy: session.user.id!,
      rejectionReason: action === "reject" ? parsed.data.rejectionReason : null,
      driverId:
        action === "approve" && parsed.data.driverId
          ? parsed.data.driverId
          : request.driverId,
      smsNotified:
        newStatus === "approved" ||
        newStatus === "out_for_delivery" ||
        newStatus === "fulfilled",
      updatedAt: new Date(),
    })
    .where(eq(requests.id, parsed.data.id));

  // SMS notifications
  const customer = request.customer;
  if (customer?.phone) {
    let message: string | null = null;

    if (newStatus === "approved") {
      message =
        request.deliveryType === "delivery"
          ? `Hi ${customer.name}! Your product request (${request.requestNumber}) at ADS Paint Center has been approved and will be delivered to you.`
          : `Hi ${customer.name}! Your product request (${request.requestNumber}) at ADS Paint Center has been approved. Our staff will prepare your order.`;
    } else if (newStatus === "out_for_delivery") {
      message = `Hi ${customer.name}! Your order (${request.requestNumber}) from ADS Paint Center is now out for delivery. Please prepare for its arrival.`;
    } else if (newStatus === "fulfilled") {
      message =
        request.deliveryType === "delivery"
          ? `Hi ${customer.name}! Your order (${request.requestNumber}) from ADS Paint Center has been delivered. Thank you!`
          : `Hi ${customer.name}! Your requested item (${request.requestNumber}) is now ready for pickup at ADS Paint Center. Please visit us during store hours.`;
    }

    if (message) await sendSMS(customer.phone, message);
  }

  revalidatePath("/requests");

  const label =
    action === "approve"
      ? "approved"
      : action === "reject"
        ? "rejected"
        : action === "mark_out_for_delivery"
          ? "marked out for delivery"
          : "marked as fulfilled";
  return { success: `Request ${request.requestNumber} ${label}.` };
}
