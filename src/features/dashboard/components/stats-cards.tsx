'use client';

import {
  BarChart3,
  ClipboardList,
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { DashboardStats } from '@/features/dashboard/types';

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  trend?: string;
  color?: string;
}

function StatCard({ title, value, description, icon, color = 'text-orange-500' }: StatCardProps) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={`${color}`}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-5 w-5 rounded" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-20 mb-1" />
        <Skeleton className="h-3 w-40" />
      </CardContent>
    </Card>
  );
}

interface StatsCardsProps {
  stats?: DashboardStats;
  isLoading?: boolean;
  error?: Error | null;
}

export function StatsCards({ stats, isLoading, error }: StatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        Failed to load dashboard stats. Please refresh the page.
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Customers',
      value: stats?.totalCustomers ?? 0,
      description: 'Registered customers',
      icon: <Users className="h-4 w-4" />,
      color: 'text-blue-500',
    },
    {
      title: 'Orders Today',
      value: stats?.ordersToday ?? 0,
      description: 'Walk-in & online orders',
      icon: <ShoppingCart className="h-4 w-4" />,
      color: 'text-orange-500',
    },
    {
      title: 'Pending Orders',
      value: stats?.pendingOrders ?? 0,
      description: 'Awaiting processing',
      icon: <ClipboardList className="h-4 w-4" />,
      color: 'text-yellow-500',
    },
    {
      title: 'Low Stock Items',
      value: stats?.lowStockItems ?? 0,
      description: 'Products below threshold',
      icon: <Package className="h-4 w-4" />,
      color: 'text-red-500',
    },
    {
      title: "Today's Revenue",
      value: `₱${(stats?.totalRevenuToday ?? 0).toLocaleString()}`,
      description: 'Total sales today',
      icon: <TrendingUp className="h-4 w-4" />,
      color: 'text-green-500',
    },
    {
      title: 'Monthly Revenue',
      value: `₱${(stats?.totalRevenueMonth ?? 0).toLocaleString()}`,
      description: 'Total sales this month',
      icon: <BarChart3 className="h-4 w-4" />,
      color: 'text-purple-500',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <StatCard key={card.title} {...card} />
      ))}
    </div>
  );
}
