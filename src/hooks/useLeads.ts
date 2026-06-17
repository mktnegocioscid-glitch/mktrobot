import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { getLeads, getLead, updateLeadStatus, deleteLead, subscribeToLeads } from '../services/leads';
import { useAuthStore } from '../store/authStore';
import type { LeadFilters } from '../services/leads';
import type { LeadStatus } from '../types';

export function useLeads(filters: LeadFilters = {}) {
  const tenantId = useAuthStore(s => s.user?.tenantId);
  const qc = useQueryClient();

  // Realtime subscription
  useEffect(() => {
    if (!tenantId) return;
    const unsub = subscribeToLeads(tenantId, () => {
      qc.invalidateQueries({ queryKey: ['leads', tenantId] });
    });
    return unsub;
  }, [tenantId, qc]);

  return useQuery({
    queryKey: ['leads', tenantId, filters],
    queryFn: () => getLeads(tenantId!, filters),
    enabled: !!tenantId,
    staleTime: 15_000,
  });
}

export function useLead(id: string) {
  return useQuery({
    queryKey: ['lead', id],
    queryFn: () => getLead(id),
    enabled: !!id,
  });
}

export function useUpdateLeadStatus() {
  const qc = useQueryClient();
  const tenantId = useAuthStore(s => s.user?.tenantId);

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: LeadStatus }) =>
      updateLeadStatus(id, status),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['leads', tenantId] });
      qc.invalidateQueries({ queryKey: ['lead', id] });
    },
  });
}

export function useDeleteLead() {
  const qc = useQueryClient();
  const tenantId = useAuthStore(s => s.user?.tenantId);

  return useMutation({
    mutationFn: (id: string) => deleteLead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leads', tenantId] });
    },
  });
}
