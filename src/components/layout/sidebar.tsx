'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  BarChart3,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Package,
  PaintBucket,
  Settings,
  ShoppingCart,
  Users,
  Warehouse,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { navItems } from '@/config/app';
import type { NavItem } from '@/config/app';
import type { UserRole } from '@/types';

const iconMap: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard className="h-4 w-4" />,
  ShoppingCart: <ShoppingCart className="h-4 w-4" />,
  ClipboardList: <ClipboardList className="h-4 w-4" />,
  Users: <Users className="h-4 w-4" />,
  Package: <Package className="h-4 w-4" />,
  Warehouse: <Warehouse className="h-4 w-4" />,
  CreditCard: <CreditCard className="h-4 w-4" />,
  MessageSquare: <MessageSquare className="h-4 w-4" />,
  BarChart3: <BarChart3 className="h-4 w-4" />,
  Settings: <Settings className="h-4 w-4" />,
};

interface SidebarProps {
  role?: UserRole;
}

export function Sidebar({ role = 'staff' }: SidebarProps) {
  const pathname = usePathname();

  const filteredItems = navItems.filter((item: NavItem) => item.roles.includes(role));

  return (
    <aside className="flex h-full w-64 flex-col border-r bg-slate-900">
      {/* Brand */}
      <div className="flex items-center gap-3 border-b border-slate-700 px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500">
          <PaintBucket className="h-5 w-5 text-white" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">ADS Paint Center</p>
          <p className="truncate text-xs text-slate-400">Management System</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {filteredItems.map((item: NavItem) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-orange-500 text-white'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white',
                  )}
                >
                  {iconMap[item.icon]}
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="border-t border-slate-700 p-3">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-slate-400 hover:bg-slate-800 hover:text-white"
          onClick={() => signOut({ callbackUrl: '/login' })}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}
