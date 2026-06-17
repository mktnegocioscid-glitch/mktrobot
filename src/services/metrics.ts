import { supabase } from '../lib/supabase';

export interface MetricsSummary {
  total: number;
  unread: number;
  uncontacted: number;
  contacted: number;
  // 14-day series
  series: { date: string; count: number }[];
  bySource: { source: string; count: number }[];
  byIntent: { intent: string; count: number }[];
}

export async function getMetricsSummary(tenantId: string): Promise<MetricsSummary> {
  // Counts by status
  const { data: counts } = await supabase
    .from('leads')
    .select('status')
    .eq('tenant_id', tenantId);

  const total       = counts?.length ?? 0;
  const unread      = counts?.filter(r => r.status === 'unread').length ?? 0;
  const uncontacted = counts?.filter(r => r.status === 'uncontacted').length ?? 0;
  const contacted   = counts?.filter(r => r.status === 'contacted').length ?? 0;

  // 14-day series
  const since = new Date();
  since.setDate(since.getDate() - 13);

  const { data: daily } = await supabase
    .from('leads')
    .select('created_at')
    .eq('tenant_id', tenantId)
    .gte('created_at', since.toISOString());

  // Group by date
  const byDate: Record<string, number> = {};
  for (let i = 0; i < 14; i++) {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    byDate[d.toISOString().slice(0, 10)] = 0;
  }
  (daily ?? []).forEach(r => {
    const k = r.created_at.slice(0, 10);
    if (k in byDate) byDate[k]++;
  });
  const series = Object.entries(byDate).map(([date, count]) => ({ date, count }));

  // By source
  const { data: srcData } = await supabase
    .from('leads')
    .select('source')
    .eq('tenant_id', tenantId)
    .not('source', 'is', null);

  const srcMap: Record<string, number> = {};
  (srcData ?? []).forEach(r => { srcMap[r.source] = (srcMap[r.source] ?? 0) + 1; });
  const bySource = Object.entries(srcMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([source, count]) => ({ source, count }));

  // By intent
  const { data: intentData } = await supabase
    .from('leads')
    .select('intent')
    .eq('tenant_id', tenantId)
    .not('intent', 'is', null);

  const intentMap: Record<string, number> = {};
  (intentData ?? []).forEach(r => { intentMap[r.intent] = (intentMap[r.intent] ?? 0) + 1; });
  const byIntent = Object.entries(intentMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([intent, count]) => ({ intent, count }));

  return { total, unread, uncontacted, contacted, series, bySource, byIntent };
}

// ── Admin: all tenants KPIs ────────────────────────────────────────────────
export async function getAdminKpis() {
  const { data } = await supabase
    .from('tenants')
    .select('id, plan, status, leads_month, leads_total, unread_count');

  const tenants   = data ?? [];
  const clients   = tenants.length;
  const leadsTotal = tenants.reduce((s, t) => s + (t.leads_total ?? 0), 0);
  const unread    = tenants.reduce((s, t) => s + (t.unread_count ?? 0), 0);

  const MRR_MAP: Record<string, number> = { Prueba: 0, Starter: 10000, Premium: 20000 };
  const mrr = tenants
    .filter(t => t.status === 'active')
    .reduce((s, t) => s + (MRR_MAP[t.plan] ?? 0), 0);

  return { clients, leadsTotal, unread, mrr, arr: mrr * 12 };
}
