"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { shopLoginAction } from "@/features/shop-auth/actions";

export function ShopLoginForm({ redirectTo }: { redirectTo: string }) {
  const [state, formAction, pending] = useActionState(shopLoginAction, undefined);

  return (
    <div className="rounded-xl border bg-white p-8 shadow-sm">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Sign In</h1>
        <p className="mt-1 text-sm text-slate-500">
          Access your ADS Paint Center account
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="redirectTo" value={redirectTo} />

        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            autoComplete="email"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />
        </div>

        {state?.error && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
            {state.error}
          </p>
        )}

        <Button
          type="submit"
          className="w-full bg-orange-500 hover:bg-orange-600 text-white"
          disabled={pending}
        >
          {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Sign In
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Don&apos;t have an account?{" "}
        <Link
          href={`/shop/register${redirectTo !== "/shop" ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`}
          className="font-medium text-orange-600 hover:underline"
        >
          Register
        </Link>
      </p>
    </div>
  );
}
