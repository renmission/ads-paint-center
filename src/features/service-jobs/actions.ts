"use server";

import { db } from "@/shared/lib/db";
import {
  serviceJobs,
  serviceJobItems,
  customers,
  services,
} from "@/shared/lib/db/schema";
import { auth } from "@/shared/lib/auth";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { sendSMS } from "@/shared/lib/sms";
import {
  createServiceJobSchema,
  updateServiceJobStatusSchema,
} from "./schemas";
import { getServiceJobById } from "./queries";

type ActionResult = { error?: string; success?: string };

export async function createServiceJobAction(
  _prevState: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };
  if (session.user.role !== "administrator")
    return { error: "Only administrators can create service jobs." };

  const rawItems = formData.get("items");
  let parsedItems: unknown = [];
  try {
    parsedItems = rawItems ? JSON.parse(String(rawItems)) : [];
  } catch {
    return { error: "Invalid items data." };
  }

  const raw = {
    customerId: formData.get("customerId"),
    serviceId: formData.get("serviceId") || "",
    scheduledAt: formData.get("scheduledAt") || "",
    address: formData.get("address") || "",
    notes: formData.get("notes") || "",
    handledBy: formData.get("handledBy") || "",
    items: parsedItems,
  };

  const parsed = createServiceJobSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { customerId, serviceId, scheduledAt, address, notes, handledBy, items } =
    parsed.data;

  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(serviceJobs)
    .where(sql`DATE(created_at) = CURRENT_DATE`);
  const seq = (Number(countResult[0].count) + 1).toString().padStart(4, "0");
  const jobNumber = `SJ-${dateStr}-${seq}`;

  const computedItems = items.map((item) => ({
    productId: item.productId || null,
    description: item.description,
    quantity: item.quantity,
    unitPrice: String(item.unitPrice),
    lineTotal: String(
      Math.round(item.quantity * item.unitPrice * 100) / 100,
    ),
  }));

  const totalAmount = computedItems.reduce(
    (sum, item) => sum + parseFloat(item.lineTotal),
    0,
  );

  const [inserted] = await db
    .insert(serviceJobs)
    .values({
      jobNumber,
      customerId,
      serviceId: serviceId || null,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      status: scheduledAt ? "scheduled" : "pending",
      address: address || null,
      notes: notes || null,
      totalAmount: String(totalAmount.toFixed(2)),
      handledBy: handledBy || null,
    })
    .returning({ id: serviceJobs.id });

  if (computedItems.length > 0) {
    await db.insert(serviceJobItems).values(
      computedItems.map((item) => ({ ...item, jobId: inserted.id })),
    );
  }

  revalidatePath("/services");

  if (scheduledAt) {
    const customer = await db.query.customers.findFirst({
      where: eq(customers.id, customerId),
      columns: { phone: true, name: true, address: true },
    });

    if (customer?.phone) {
      const scheduledDate = new Date(scheduledAt).toLocaleString("en-PH", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      let serviceName = "service";
      if (serviceId) {
        const svc = await db.query.services.findFirst({
          where: eq(services.id, serviceId),
          columns: { name: true },
        });
        if (svc) serviceName = svc.name;
      }

      const jobAddress = address || customer.address || "";

      try {
        await sendSMS(
          customer.phone,
          `Hi ${customer.name}! Your ${serviceName} (Job ${jobNumber}) is scheduled for ${scheduledDate}${jobAddress ? `. Location: ${jobAddress}` : ""}. — ADS Paint Center`,
        );
      } catch (err) {
        console.error("SMS send failed:", err);
      }
    }
  }

  return { success: `Service job ${jobNumber} created successfully.` };
}

export async function updateServiceJobStatusAction(
  _prevState: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };
  if (session.user.role !== "administrator")
    return { error: "Only administrators can update service jobs." };

  const parsed = updateServiceJobStatusSchema.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { id, status } = parsed.data;

  await db
    .update(serviceJobs)
    .set({ status, updatedAt: new Date() })
    .where(eq(serviceJobs.id, id));

  revalidatePath("/services");

  if (status === "scheduled") {
    const job = await getServiceJobById(id);
    if (job?.scheduledAt && job.customerPhone) {
      const scheduledDate = job.scheduledAt.toLocaleString("en-PH", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      const jobAddress = job.address || job.customerAddress || "";

      try {
        await sendSMS(
          job.customerPhone,
          `Hi ${job.customerName}! Your ${job.serviceName ?? "service"} (Job ${job.jobNumber}) is scheduled for ${scheduledDate}${jobAddress ? `. Location: ${jobAddress}` : ""}. — ADS Paint Center`,
        );
      } catch (err) {
        console.error("SMS send failed:", err);
      }
    }
  }

  return { success: `Job status updated to ${status}.` };
}

export async function fetchServiceJobDetailAction(
  id: string,
): Promise<{ data?: Awaited<ReturnType<typeof getServiceJobById>>; error?: string }> {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  try {
    const data = await getServiceJobById(id);
    return { data };
  } catch {
    return { error: "Failed to load job details." };
  }
}
