"use server";

import { db } from "@/shared/lib/db";
import { requests } from "@/shared/lib/db/schema";
import { createRequestSchema, handleRequestSchema } from "./schemas";
import { auth } from "@/shared/lib/auth";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

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

  await db
    .update(requests)
    .set({
      status: newStatus,
      handledBy: session.user.id!,
      rejectionReason:
        parsed.data.action === "reject" ? parsed.data.rejectionReason : null,
      updatedAt: new Date(),
      // TODO Phase 5 — send SMS notification to customer
    })
    .where(eq(requests.id, parsed.data.id));

  revalidatePath("/requests");
  const label = parsed.data.action === "approve" ? "approved" : parsed.data.action === "reject" ? "rejected" : "marked as fulfilled";
  return { success: `Request ${request.requestNumber} ${label}.` };
}
