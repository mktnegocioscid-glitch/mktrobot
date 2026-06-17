import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!SUPABASE_URL || !SUPABASE_ANON) {
  throw new Error('Missing Supabase env vars. Check your .env file.');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// ── Typed helpers ──────────────────────────────────────────────────────────
export type DbResult<T> = { data: T | null; error: string | null };

export async function dbQuery<T>(
  promise: PromiseLike<{ data: T | null; error: { message: string } | null }>
): Promise<DbResult<T>> {
  const { data, error } = await promise;
  return { data, error: error?.message ?? null };
}
