import { supabase } from '../lib/supabase';
import type { Widget, Question } from '../types';

// ── List widgets ───────────────────────────────────────────────────────────
export async function getWidgets(tenantId: string) {
  const { data, error } = await supabase
    .from('widgets')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Widget[];
}

// ── Single widget ──────────────────────────────────────────────────────────
export async function getWidget(id: string) {
  const { data, error } = await supabase
    .from('widgets')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw new Error(error.message);
  return data as Widget;
}

// ── Create widget ──────────────────────────────────────────────────────────
export async function createWidget(tenantId: string, input: Partial<Widget>) {
  const { data, error } = await supabase
    .from('widgets')
    .insert({ tenant_id: tenantId, ...input })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Widget;
}

// ── Update widget ──────────────────────────────────────────────────────────
export async function updateWidget(id: string, input: Partial<Widget>) {
  const { error } = await supabase
    .from('widgets')
    .update(input)
    .eq('id', id);
  if (error) throw new Error(error.message);
}

// ── Toggle status ──────────────────────────────────────────────────────────
export async function toggleWidgetStatus(id: string, status: 'active' | 'paused') {
  const { error } = await supabase
    .from('widgets')
    .update({ status })
    .eq('id', id);
  if (error) throw new Error(error.message);
}

// ── Delete widget ──────────────────────────────────────────────────────────
export async function deleteWidget(id: string) {
  const { error } = await supabase.from('widgets').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// ── Questions ──────────────────────────────────────────────────────────────
export async function getQuestions(widgetId: string) {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('widget_id', widgetId)
    .order('sort_order', { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as Question[];
}

export async function saveQuestions(widgetId: string, questions: Partial<Question>[]) {
  // Delete all existing questions for this widget, then re-insert
  const { error: delErr } = await supabase
    .from('questions')
    .delete()
    .eq('widget_id', widgetId);
  if (delErr) throw new Error(delErr.message);

  const rows = questions.map((q, i) => ({
    widget_id:  widgetId,
    sort_order: i,
    kind:       q.kind,
    label:      q.label,
    prompt:     q.prompt,
    enabled:    q.enabled ?? true,
    options:    q.options ?? null,
    field:      q.field ?? null,
  }));

  const { error } = await supabase.from('questions').insert(rows);
  if (error) throw new Error(error.message);
}

// ── Public config (no auth, used by widget script) ────────────────────────
export async function getWidgetPublicConfig(widgetId: string) {
  const { data: widget, error: we } = await supabase
    .from('widgets')
    .select('id, bot_name, accent_color, greeting, position, status, tenant_id')
    .eq('id', widgetId)
    .eq('status', 'active')
    .single();
  if (we || !widget) throw new Error('Widget not found or inactive');

  const { data: questions, error: qe } = await supabase
    .from('questions')
    .select('*')
    .eq('widget_id', widgetId)
    .eq('enabled', true)
    .order('sort_order', { ascending: true });
  if (qe) throw new Error(qe.message);

  return { widget, questions: questions ?? [] };
}
