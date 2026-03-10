"use server";

import { signIn, signOut } from "@/shared/lib/auth";
import { loginSchema } from "./schemas";
import { AuthError } from "next-auth";

export async function loginAction(
  _prevState: { error: string } | undefined,
  formData: FormData
) {
  const raw = Object.fromEntries(formData);
  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Invalid credentials format" };
  }

  try {
    await signIn("credentials", {
      ...parsed.data,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password" };
    }
    throw error;
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}
