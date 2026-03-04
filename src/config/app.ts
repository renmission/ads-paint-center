import type { UserRole } from '@/types';

export const APP_NAME = 'ADS Paint Center IMS';
export const APP_DESCRIPTION =
  'ADS Paint Center Integrated Management System With SMS Notification';
export const APP_VERSION = '1.0.0';

// ─── Navigation Routes ────────────────────────────────────────

export interface NavItem {
  label: string;
  href: string;
  icon: string; // lucide icon name
  roles: UserRole[];
  children?: NavItem[];
}

export const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: 'LayoutDashboard',
    roles: ['admin', 'staff'],
  },
  {
    label: 'Point of Sale',
    href: '/pos',
    icon: 'ShoppingCart',
    roles: ['admin', 'staff'],
  },
  {
    label: 'Orders',
    href: '/orders',
    icon: 'ClipboardList',
    roles: ['admin', 'staff'],
  },
  {
    label: 'Customers',
    href: '/customers',
    icon: 'Users',
    roles: ['admin', 'staff'],
  },
  {
    label: 'Products',
    href: '/products',
    icon: 'Package',
    roles: ['admin', 'staff'],
  },
  {
    label: 'Inventory',
    href: '/inventory',
    icon: 'Warehouse',
    roles: ['admin', 'staff'],
  },
  {
    label: 'Payments',
    href: '/payments',
    icon: 'CreditCard',
    roles: ['admin', 'staff'],
  },
  {
    label: 'SMS Logs',
    href: '/sms-logs',
    icon: 'MessageSquare',
    roles: ['admin'],
  },
  {
    label: 'Reports',
    href: '/reports',
    icon: 'BarChart3',
    roles: ['admin'],
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: 'Settings',
    roles: ['admin'],
  },
];

// ─── Order Status Labels & Colors ─────────────────────────────

export const ORDER_STATUS_LABELS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  ready: 'Ready for Pickup',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
} as const;

export const ORDER_STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  ready: 'bg-green-100 text-green-800',
  delivered: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
} as const;

export const PAYMENT_STATUS_COLORS = {
  unpaid: 'bg-red-100 text-red-800',
  partial: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
} as const;
