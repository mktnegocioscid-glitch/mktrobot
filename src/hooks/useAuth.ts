import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { onAuthStateChange } from '../services/auth';

// Call once at app root to keep auth in sync with Supabase session
export function useAuthSync() {
  const { login, logout } = useAuthStore();

  useEffect(() => {
    const { data: { subscription } } = onAuthStateChange((user) => {
      if (user) {
        login(user, ''); // token managed by Supabase internally
      } else {
        logout();
      }
    });
    return () => subscription.unsubscribe();
  }, [login, logout]);
}

export function useAuth() {
  return useAuthStore(s => ({
    user: s.user,
    isAdmin: s.user?.role === 'superadmin',
    isClient: s.user?.role === 'client',
    tenantId: s.user?.tenantId,
    impersonating: s.impersonating,
  }));
}
