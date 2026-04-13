"use server";

import { db } from "@/shared/lib/db";
import { customers } from "@/shared/lib/db/schema";
import { createCustomerSchema, updateCustomerSchema } from "./schemas";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

type ActionResult = { error?: string; success?: string };

export async function createCustomerAction(
  _prevState: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const raw = Object.fromEntries(formData);
  const parsed = createCustomerSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const existing = await db.query.customers.findFirst({
    where: eq(customers.phone, parsed.data.phone),
  });
  if (existing)
    return { error: "A customer with this phone number already exists." };

  await db.insert(customers).values({
    name: parsed.data.name,
    email: parsed.data.email || null,
    phone: parsed.data.phone,
    address: parsed.data.address || null,
    notes: parsed.data.notes || null,
  });

  revalidatePath("/customers");
  return { success: "Customer registered successfully." };
}

export async function updateCustomerAction(
  _prevState: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const raw = Object.fromEntries(formData);
  const parsed = updateCustomerSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await db
    .update(customers)
    .set({
      name: parsed.data.name,
      email: parsed.data.email || null,
      phone: parsed.data.phone,
      address: parsed.data.address || null,
      notes: parsed.data.notes || null,
      updatedAt: new Date(),
    })
    .where(eq(customers.id, parsed.data.id));

  revalidatePath("/customers");
  revalidatePath(`/customers/${parsed.data.id}`);
  return { success: "Customer updated successfully." };
}
