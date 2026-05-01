"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { Button } from "@/shared/components/ui/button";
import type { Session } from "next-auth";

type Props = { user: Session["user"] | null };

export function ShopHeaderNav({ user }: Props) {
  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/shop/login"
          className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          Sign In
        </Link>
        <Button
          size="sm"
          className="bg-orange-500 hover:bg-orange-600 text-white"
          asChild
        >
          <Link href="/shop/register">Register</Link>
        </Button>
      </div>
    );
  }

  if (user.role === "customer") {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-600">
          Hi, {user.name?.split(" ")[0] ?? "there"}
        </span>
        <Button
          size="sm"
          variant="outline"
          onClick={() => signOut({ callbackUrl: "/shop" })}
        >
          Sign Out
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-400 capitalize">{user.role}</span>
      <Button size="sm" variant="outline" asChild>
        <Link href="/dashboard">Dashboard</Link>
      </Button>
    </div>
  );
}
