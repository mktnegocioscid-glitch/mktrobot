import { supabase } from '../lib/supabase';
import type { Lead, LeadStatus } from '../types';

// ── List leads (paginated + filtered) ──────────────────────────────────────
export interface LeadFilters {
  status?: LeadStatus | 'all';
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  widgetId?: string;
  page?: number;
  pageSize?: number;
}

export async function getLeads(tenantId: string, filters: LeadFilters = {}) {
  const { status, search, dateFrom, dateTo, widgetId, page = 1, pageSize = 50 } = filters;

  let q = supabase
    .from('leads')
    .select('*', { count: 'exact' })
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (status && status !== 'all') q = q.eq('status', status);
  if (widgetId) q = q.eq('widget_id', widgetId);
  if (dateFrom) q = q.gte('created_at', dateFrom);
  if (dateTo)   q = q.lte('created_at', dateTo);
  if (search)   q = q.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);

  const { data, error, count } = await q;
  if (error) throw new Error(error.message);
  return { leads: (data ?? []) as Lead[], total: count ?? 0 };
}

// ── Single lead ────────────────────────────────────────────────────────────
export async function getLead(id: string) {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw new Error(error.message);
  return data as Lead;
}

// ── Update status ──────────────────────────────────────────────────────────
export async function updateLeadStatus(id: string, status: LeadStatus) {
  const { error } = await supabase
    .from('leads')
    .update({ status })
    .eq('id', id);
  if (error) throw new Error(error.message);
}

// ── Delete lead ────────────────────────────────────────────────────────────
export async function deleteLead(id: string) {
  const { error } = await supabase
    .from('leads')
    .delete()
    .eq('id', id);
  if (error) throw new Error(error.message);
}

// ── Public: submit lead from widget (no auth) ──────────────────────────────
export interface LeadPayload {
  widgetId: string;
  tenantId: string;
  name?: string;
  email?: string;
  phone?: string;
  intent?: string;
  source?: string;
  snippet?: string;
  conversation?: object[];
  country?: string;
  device?: string;
  os?: string;
  browser?: string;
}

export async function submitLead(payload: LeadPayload) {
  const { widgetId, tenantId, ...rest } = payload;
  const { error } = await supabase.from('leads').insert({
    widget_id:   widgetId,
    tenant_id:   tenantId,
    name:        rest.name,
    email:       rest.email,
    phone:       rest.phone,
    intent:      rest.intent,
    source:      rest.source,
    snippet:     rest.snippet,
    conversation: rest.conversation ?? [],
    country:     rest.country,
    device:      rest.device,
    os:          rest.os,
    browser:     rest.browser,
    status:      'unread',
  });
  if (error) throw new Error(error.message);
}

// ── Realtime subscription ──────────────────────────────────────────────────
export function subscribeToLeads(tenantId: string, onNew: (lead: Lead) => void) {
  const channel = supabase
    .channel(`leads:tenant:${tenantId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'leads', filter: `tenant_id=eq.${tenantId}` },
      (payload) => onNew(payload.new as Lead)
    )
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}
