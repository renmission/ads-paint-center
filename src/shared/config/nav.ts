import {
  LayoutDashboard,
  Package,
  Users,
  Wrench,
  CalendarDays,
  ShoppingCart,
  History,
  ClipboardList,
  UserCog,
  Settings,
  Landmark,
  ShoppingBag,
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
    title: "Staff",
    href: "/staff",
    icon: UserCog,
    roles: ["administrator"],
  },
  {
    title: "Customers",
    href: "/customers",
    icon: Users,
    roles: ["administrator", "staff"],
  },
  {
    title: "POS",
    href: "/pos",
    icon: ShoppingCart,
    roles: ["administrator", "staff"],
  },
  {
    title: "Appointments",
    href: "/appointments",
    icon: CalendarDays,
    roles: ["administrator", "staff"],
  },
  {
    title: "Online Orders",
    href: "/orders",
    icon: ShoppingBag,
    roles: ["administrator", "staff"],
  },
  {
    title: "Services",
    href: "/services",
    icon: Wrench,
    roles: ["administrator", "staff"],
  },
  {
    title: "Sales History",
    href: "/sales",
    icon: History,
    roles: ["administrator", "staff"],
  },
  {
    title: "Inventory",
    href: "/inventory",
    icon: Package,
    roles: ["administrator", "staff"],
  },
  {
    title: "Requests",
    href: "/requests",
    icon: ClipboardList,
    roles: ["administrator", "staff"],
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    roles: ["administrator"],
  },
];
