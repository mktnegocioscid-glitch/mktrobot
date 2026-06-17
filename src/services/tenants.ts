import { supabase } from '../lib/supabase';
import type { Tenant } from '../types';

export async function getTenants() {
  const { data, error } = await supabase
    .from('tenants')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Tenant[];
}

export async function getTenant(id: string) {
  const { data, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw new Error(error.message);
  return data as Tenant;
}

export async function updateTenant(id: string, input: Partial<Tenant>) {
  const { error } = await supabase
    .from('tenants')
    .update(input)
    .eq('id', id);
  if (error) throw new Error(error.message);
}

export async function deleteTenant(id: string) {
  const { error } = await supabase.from('tenants').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
