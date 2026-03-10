"use server";

import { db } from "@/shared/lib/db";
import { users } from "@/shared/lib/db/schema";
import { auth } from "@/shared/lib/auth";
import {
  createStaffSchema,
  updateStaffSchema,
  changePasswordSchema,
} from "./schemas";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

type ActionResult = { error?: string; success?: string };

async function requireAdmin(): Promise<string | null> {
  const session = await auth();
  if (!session || session.user.role !== "administrator") return "Unauthorized";
  return null;
}

export async function createStaffAction(
  _prevState: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  const denied = await requireAdmin();
  if (denied) return { error: denied };

  const raw = Object.fromEntries(formData);
  const parsed = createStaffSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const existing = await db.query.users.findFirst({
    where: eq(users.email, parsed.data.email),
  });
  if (existing) return { error: "Email is already in use." };

  const hashedPassword = await bcrypt.hash(parsed.data.password, 12);
  await db.insert(users).values({
    name: parsed.data.name,
    email: parsed.data.email,
    password: hashedPassword,
    role: parsed.data.role,
    phone: parsed.data.phone || null,
  });

  revalidatePath("/staff");
  return { success: "Staff member created successfully." };
}

export async function updateStaffAction(
  _prevState: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  const denied = await requireAdmin();
  if (denied) return { error: denied };

  const raw = Object.fromEntries(formData);
  const parsed = updateStaffSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await db
    .update(users)
    .set({
      name: parsed.data.name,
      phone: parsed.data.phone || null,
      role: parsed.data.role,
      updatedAt: new Date(),
    })
    .where(eq(users.id, parsed.data.id));

  revalidatePath("/staff");
  return { success: "Staff member updated successfully." };
}

export async function toggleStaffActiveAction(
  _prevState: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  const session = await auth();
  if (!session || session.user.role !== "administrator") return { error: "Unauthorized" };

  const id = formData.get("id") as string;
  if (!id) return { error: "Invalid staff ID." };

  if (session.user.id === id) {
    return { error: "You cannot deactivate your own account." };
  }

  const target = await db.query.users.findFirst({ where: eq(users.id, id) });
  if (!target) return { error: "Staff member not found." };

  await db
    .update(users)
    .set({ isActive: !target.isActive, updatedAt: new Date() })
    .where(eq(users.id, id));

  revalidatePath("/staff");
  return {
    success: `Staff member ${!target.isActive ? "activated" : "deactivated"} successfully.`,
  };
}

export async function changeStaffPasswordAction(
  _prevState: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  const denied = await requireAdmin();
  if (denied) return { error: denied };

  const raw = Object.fromEntries(formData);
  const parsed = changePasswordSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const hashedPassword = await bcrypt.hash(parsed.data.password, 12);
  await db
    .update(users)
    .set({ password: hashedPassword, updatedAt: new Date() })
    .where(eq(users.id, parsed.data.id));

  revalidatePath("/staff");
  return { success: "Password changed successfully." };
}
