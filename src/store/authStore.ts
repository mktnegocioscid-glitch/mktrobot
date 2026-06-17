import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Role } from '../types';

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  // For admin impersonating a client
  impersonating: { tenantId: string; tenantName: string } | null;

  login: (user: User, token: string) => void;
  logout: () => void;
  setToken: (token: string) => void;
  startImpersonation: (tenantId: string, tenantName: string, token: string) => void;
  stopImpersonation: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      impersonating: null,

      login: (user, accessToken) => set({ user, accessToken }),
      logout: () => set({ user: null, accessToken: null, impersonating: null }),
      setToken: (accessToken) => set({ accessToken }),
      startImpersonation: (tenantId, tenantName, token) =>
        set({ impersonating: { tenantId, tenantName }, accessToken: token }),
      stopImpersonation: () => set({ impersonating: null }),
    }),
    { name: 'cr_auth', partialize: (s) => ({ user: s.user, accessToken: s.accessToken }) }
  )
);

// Convenience selectors
export const useUser = () => useAuthStore((s) => s.user);
export const useRole = (): Role | null => useAuthStore((s) => s.user?.role ?? null);
export const useIsAdmin = () => useAuthStore((s) => s.user?.role === 'superadmin');
