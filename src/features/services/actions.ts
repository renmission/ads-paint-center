"use server";

import { db } from "@/shared/lib/db";
import { services } from "@/shared/lib/db/schema";
import {
  createServiceSchema,
  editServiceSchema,
  toggleServiceSchema,
} from "./schemas";
import { auth } from "@/shared/lib/auth";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

type ActionResult = { error?: string; success?: string };

export async function createServiceAction(
  _prevState: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };
  if (session.user.role !== "administrator") {
    return { error: "Only administrators can create services." };
  }

  const raw = Object.fromEntries(formData);
  const parsed = createServiceSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await db.insert(services).values({
    name: parsed.data.name,
    description: parsed.data.description || null,
    price: parseFloat(parsed.data.price).toFixed(2),
    duration: parseInt(parsed.data.duration),
    category: parsed.data.category,
  });

  revalidatePath("/services");
  return { success: `Service "${parsed.data.name}" created.` };
}

export async function editServiceAction(
  _prevState: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };
  if (session.user.role !== "administrator") {
    return { error: "Only administrators can edit services." };
  }

  const raw = Object.fromEntries(formData);
  const parsed = editServiceSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await db
    .update(services)
    .set({
      name: parsed.data.name,
      description: parsed.data.description || null,
      price: parseFloat(parsed.data.price).toFixed(2),
      duration: parseInt(parsed.data.duration),
      category: parsed.data.category,
      updatedAt: new Date(),
    })
    .where(eq(services.id, parsed.data.id));

  revalidatePath("/services");
  return { success: `Service "${parsed.data.name}" updated.` };
}

export async function toggleServiceAction(
  _prevState: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };
  if (session.user.role !== "administrator") {
    return { error: "Only administrators can toggle services." };
  }

  const raw = Object.fromEntries(formData);
  const parsed = toggleServiceSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const isActive = parsed.data.isActive === "true";
  await db
    .update(services)
    .set({ isActive, updatedAt: new Date() })
    .where(eq(services.id, parsed.data.id));

  revalidatePath("/services");
  revalidatePath("/appointments");
  return { success: `Service ${isActive ? "activated" : "deactivated"}.` };
}
