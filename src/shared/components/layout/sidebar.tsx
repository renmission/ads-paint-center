"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/lib/utils";
import { navItems } from "@/shared/config/nav";
import { siteConfig } from "@/shared/config/site";
import { Separator } from "@/shared/components/ui/separator";

interface SidebarProps {
  role: "administrator" | "staff";
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const filtered = navItems.filter((item) => item.roles.includes(role));

  return (
    <aside className="hidden w-64 flex-shrink-0 flex-col border-r bg-card md:flex">
      <div className="flex h-16 items-center px-6">
        <span className="text-lg font-semibold tracking-tight">
          {siteConfig.name}
        </span>
      </div>
      <Separator />
      <nav className="flex-1 space-y-1 p-4">
        {filtered.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          return (
            <div key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.title}
              </Link>
              {item.children
                ?.filter((child) => child.roles.includes(role))
                .map((child) => {
                  const isChildActive = pathname.startsWith(child.href);
                  return (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={cn(
                        "mt-1 flex items-center gap-3 rounded-md py-2 pl-8 pr-3 text-sm font-medium transition-colors",
                        isChildActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                      )}
                    >
                      <child.icon className="h-4 w-4 shrink-0" />
                      {child.title}
                    </Link>
                  );
                })}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
