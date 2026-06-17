import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import type { User } from '../types';

// ── Login ──────────────────────────────────────────────────────────────────
export async function login(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);

  const authUser = data.user;
  if (!authUser) throw new Error('No user returned');

  // Fetch user profile (role + tenant_id)
  const { data: profile, error: profileErr } = await supabase
    .from('users')
    .select('role, tenant_id, email')
    .eq('id', authUser.id)
    .single();

  if (profileErr || !profile) throw new Error('No se encontró el perfil del usuario');

  const user: User = {
    id: authUser.id,
    email: profile.email,
    role: profile.role,
    tenantId: profile.tenant_id,
  };

  useAuthStore.getState().login(user, data.session?.access_token ?? '');
  return user;
}

// ── Logout ─────────────────────────────────────────────────────────────────
export async function logout() {
  await supabase.auth.signOut();
  useAuthStore.getState().logout();
}

// ── Get current session ────────────────────────────────────────────────────
export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

// ── Listen to auth changes ─────────────────────────────────────────────────
export function onAuthStateChange(cb: (user: User | null) => void) {
  return supabase.auth.onAuthStateChange(async (_event, session) => {
    if (!session) { cb(null); return; }

    const { data: profile } = await supabase
      .from('users')
      .select('role, tenant_id, email')
      .eq('id', session.user.id)
      .single();

    if (profile) {
      cb({
        id: session.user.id,
        email: profile.email,
        role: profile.role,
        tenantId: profile.tenant_id,
      });
    } else {
      cb(null);
    }
  });
}
