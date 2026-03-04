// ─── Global TypeScript Types ──────────────────────────────────
// ADS Paint Center Integrated Management System

// User roles
export type UserRole = 'admin' | 'staff';

// Order status
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'ready'
  | 'delivered'
  | 'cancelled';

// Order type
export type OrderType = 'walk_in' | 'online';

// Payment status
export type PaymentStatus = 'unpaid' | 'partial' | 'paid';

// Payment type
export type PaymentType = 'downpayment' | 'full' | 'balance' | 'other';

// Payment method
export type PaymentMethod = 'cash' | 'gcash' | 'bank_transfer' | 'other';

// SMS notification status
export type SmsStatus = 'pending' | 'sent' | 'failed';

// Inventory change type
export type InventoryChangeType = 'purchase' | 'sale' | 'adjustment' | 'return' | 'damage';

// ─── API Response Wrapper ─────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ─── Pagination ───────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

// ─── Dashboard ────────────────────────────────────────────────

export interface DashboardStats {
  totalCustomers: number;
  ordersToday: number;
  pendingOrders: number;
  lowStockItems: number;
  totalRevenuToday: number;
  totalRevenueMonth: number;
}

// ─── Next.js Auth Session Extension ──────────────────────────

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image?: string | null;
      role: UserRole;
    };
  }

  interface User {
    role?: UserRole;
  }
}
