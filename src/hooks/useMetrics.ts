import { useQuery } from '@tanstack/react-query';
import { getMetricsSummary, getAdminKpis } from '../services/metrics';
import { useAuthStore } from '../store/authStore';

export function useMetrics() {
  const tenantId = useAuthStore(s => s.user?.tenantId);

  return useQuery({
    queryKey: ['metrics', tenantId],
    queryFn: () => getMetricsSummary(tenantId!),
    enabled: !!tenantId,
    staleTime: 60_000,
    refetchInterval: 120_000,
  });
}

export function useAdminKpis() {
  return useQuery({
    queryKey: ['admin-kpis'],
    queryFn: getAdminKpis,
    staleTime: 60_000,
  });
}
