"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/components/ui/sheet";
import { cn } from "@/shared/lib/utils";
import { navItems } from "@/shared/config/nav";
import { siteConfig } from "@/shared/config/site";

interface MobileNavProps {
  role: "administrator" | "staff" | "customer";
}

export function MobileNav({ role }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const filtered = navItems.filter((item) => item.roles.includes(role));

  const [expanded, setExpanded] = useState<string | null>(() => {
    const withChildren = filtered.find((item) =>
      item.children?.some((child) => pathname.startsWith(child.href)),
    );
    return withChildren?.title ?? null;
  });

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <SheetHeader className="border-b p-6">
          <SheetTitle>{siteConfig.name}</SheetTitle>
        </SheetHeader>
        <nav className="space-y-1 p-4">
          {filtered.map((item) => {
            const key = item.href ?? item.title;
            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = expanded === item.title;

            if (hasChildren) {
              return (
                <div key={key}>
                  <button
                    type="button"
                    onClick={() => setExpanded(isExpanded ? null : item.title)}
                    className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span className="flex-1 text-left">{item.title}</span>
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 shrink-0" />
                    ) : (
                      <ChevronRight className="h-4 w-4 shrink-0" />
                    )}
                  </button>
                  {isExpanded &&
                    item
                      .children!.filter((child) => child.roles.includes(role))
                      .map((child) => {
                        const isChildActive = pathname.startsWith(child.href);
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => setOpen(false)}
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
            }

            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : item.href
                  ? pathname.startsWith(item.href)
                  : false;

            return (
              <Link
                key={key}
                href={item.href!}
                onClick={() => setOpen(false)}
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
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
