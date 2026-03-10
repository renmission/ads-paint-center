import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  ClipboardList,
  UserCog,
  Settings,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  roles: ("administrator" | "staff")[];
};

export const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["administrator", "staff"],
  },
  {
    title: "Inventory",
    href: "/inventory",
    icon: Package,
    roles: ["administrator", "staff"],
  },
  {
    title: "Customers",
    href: "/customers",
    icon: Users,
    roles: ["administrator", "staff"],
  },
  {
    title: "POS / Sales",
    href: "/sales",
    icon: ShoppingCart,
    roles: ["administrator", "staff"],
  },
  {
    title: "Requests",
    href: "/requests",
    icon: ClipboardList,
    roles: ["administrator", "staff"],
  },
  {
    title: "Staff",
    href: "/staff",
    icon: UserCog,
    roles: ["administrator"],
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    roles: ["administrator"],
  },
];
