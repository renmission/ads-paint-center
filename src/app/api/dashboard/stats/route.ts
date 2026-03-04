import { NextResponse } from 'next/server';
import type { DashboardStats } from '@/types';

export async function GET() {
  try {
    // TODO: Replace with real DB queries once database is connected
    // import { db } from '@/lib/db';
    // import { customers, orders, products } from '@/lib/db/schema';

    const stats: DashboardStats = {
      totalCustomers: 0,
      ordersToday: 0,
      pendingOrders: 0,
      lowStockItems: 0,
      totalRevenuToday: 0,
      totalRevenueMonth: 0,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('[API] Dashboard stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
