'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import type { DashboardStats } from '@/features/dashboard/types';

export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      const { data } = await axios.get<DashboardStats>('/api/dashboard/stats');
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
  });
}
