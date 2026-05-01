"use server";

import { signIn } from "@/shared/lib/auth";
import { shopLoginSchema, shopRegisterSchema } from "./schemas";
import { AuthError } from "next-auth";
import { db } from "@/shared/lib/db";
import { users } from "@/shared/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

function safeRedirectTo(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/shop";
  return value;
}

export async function shopLoginAction(
  _prev: { error: string } | undefined,
  formData: FormData,
) {
  const raw = Object.fromEntries(formData);
  const parsed = shopLoginSchema.safeParse(raw);
  if (!parsed.success) return { error: "Invalid email or password format" };

  const redirectTo = safeRedirectTo(formData.get("redirectTo") as string);

  try {
    await signIn("credentials", { ...parsed.data, redirectTo });
  } catch (error) {
    if (error instanceof AuthError) return { error: "Invalid email or password" };
    throw error;
  }
}

export async function shopRegisterAction(
  _prev: { error: string } | undefined,
  formData: FormData,
) {
  const raw = Object.fromEntries(formData);
  const parsed = shopRegisterSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const existing = await db.query.users.findFirst({
    where: eq(users.email, parsed.data.email),
  });
  if (existing) return { error: "An account with this email already exists." };

  const hashedPassword = await bcrypt.hash(parsed.data.password, 12);
  await db.insert(users).values({
    name: parsed.data.name,
    email: parsed.data.email,
    password: hashedPassword,
    role: "customer",
    phone: parsed.data.phone,
    isActive: true,
  });

  const redirectTo = safeRedirectTo(formData.get("redirectTo") as string);

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo,
    });
  } catch (error) {
    if (error instanceof AuthError)
      return { error: "Account created. Please sign in to continue." };
    throw error;
  }
}
