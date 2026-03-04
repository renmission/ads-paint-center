'use client';

import { StatsCards } from '@/features/dashboard/components/stats-cards';
import { useDashboardStats } from '@/features/dashboard/queries/use-dashboard-stats';
import { CalendarDays } from 'lucide-react';

export default function DashboardPage() {
  const { data: stats, isLoading, error } = useDashboardStats();

  const today = new Date().toLocaleDateString('en-PH', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h2>
          <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            <span>{today}</span>
          </div>
        </div>
      </div>

      {/* Stats cards with loading skeletons & error boundary */}
      <StatsCards stats={stats} isLoading={isLoading} error={error} />

      {/* Quick info section */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-slate-700">Getting Started</h3>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex items-center gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-600">
                1
              </span>
              Configure your NeonDB connection in <code className="text-xs">.env.local</code>
            </li>
            <li className="flex items-center gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-600">
                2
              </span>
              Run <code className="text-xs">pnpm db:push</code> to create tables
            </li>
            <li className="flex items-center gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-600">
                3
              </span>
              Add your iPROGSMS API key for SMS notifications
            </li>
          </ul>
        </div>

        <div className="rounded-lg border bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-slate-700">System Modules</h3>
          <div className="grid grid-cols-2 gap-2 text-sm text-slate-600">
            {[
              'Point of Sale (POS)',
              'Walk-in & Online Orders',
              'Customer Management',
              'Product & Inventory',
              'Payment Processing',
              'SMS Notifications',
              'Sales Reports',
              'User Management',
            ].map((module) => (
              <div key={module} className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
                {module}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
