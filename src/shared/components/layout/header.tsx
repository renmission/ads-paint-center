import { Separator } from "@/shared/components/ui/separator";
import { NavUser } from "./nav-user";
import { MobileNav } from "./mobile-nav";
import type { Session } from "next-auth";

interface HeaderProps {
  user: Session["user"];
  role: "administrator" | "staff" | "customer";
}

export function Header({ user, role }: HeaderProps) {
  return (
    <header className="flex h-16 flex-shrink-0 items-center justify-between border-b bg-card px-4 md:px-6">
      <MobileNav role={role} />
      <div className="flex-1" />
      <NavUser user={user} />
    </header>
  );
}
