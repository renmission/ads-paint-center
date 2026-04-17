"use server";

import { db } from "@/shared/lib/db";
import { units } from "@/shared/lib/db/schema";
import { auth } from "@/shared/lib/auth";
import {
  createUnitSchema,
  updateUnitSchema,
  toggleUnitActiveSchema,
} from "./schemas";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

type ActionResult = { error?: string; success?: string };

async function requireAdmin(): Promise<string | null> {
  const session = await auth();
  if (!session || session.user.role !== "administrator") return "Unauthorized";
  return null;
}

export async function createUnitAction(
  _prevState: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const denied = await requireAdmin();
  if (denied) return { error: denied };

  const raw = Object.fromEntries(formData);
  const parsed = createUnitSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const existing = await db.query.units.findFirst({
    where: eq(units.name, parsed.data.name),
  });
  if (existing) return { error: "A unit with this name already exists." };

  await db.insert(units).values({
    name: parsed.data.name,
    abbreviation: parsed.data.abbreviation,
  });

  revalidatePath("/settings/units");
  revalidatePath("/inventory");
  return { success: "Unit created successfully." };
}

export async function updateUnitAction(
  _prevState: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const denied = await requireAdmin();
  if (denied) return { error: denied };

  const raw = Object.fromEntries(formData);
  const parsed = updateUnitSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const duplicate = await db.query.units.findFirst({
    where: eq(units.name, parsed.data.name),
  });
  if (duplicate && duplicate.id !== parsed.data.id) {
    return { error: "A unit with this name already exists." };
  }

  await db
    .update(units)
    .set({
      name: parsed.data.name,
      abbreviation: parsed.data.abbreviation,
      updatedAt: new Date(),
    })
    .where(eq(units.id, parsed.data.id));

  revalidatePath("/settings/units");
  revalidatePath("/inventory");
  return { success: "Unit updated successfully." };
}

export async function toggleUnitActiveAction(
  _prevState: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const denied = await requireAdmin();
  if (denied) return { error: denied };

  const raw = Object.fromEntries(formData);
  const parsed = toggleUnitActiveSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const target = await db.query.units.findFirst({
    where: eq(units.id, parsed.data.id),
  });
  if (!target) return { error: "Unit not found." };

  await db
    .update(units)
    .set({ isActive: !target.isActive, updatedAt: new Date() })
    .where(eq(units.id, parsed.data.id));

  revalidatePath("/settings/units");
  revalidatePath("/inventory");
  return {
    success: `Unit ${!target.isActive ? "restored" : "archived"} successfully.`,
  };
}
