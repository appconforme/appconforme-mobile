import { create } from 'zustand';
import type { AuthCompany, AuthUser } from '@/lib/api/types';
import { authStorage } from './storage';

interface AuthState {
  hydrated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  companies: AuthCompany[];
  activeCompanyId: string | null;

  hydrate: () => Promise<void>;
  setSession: (input: {
    accessToken: string;
    refreshToken: string;
    user: AuthUser;
  }) => Promise<void>;
  setMe: (input: { user: AuthUser; companies: AuthCompany[] }) => Promise<void>;
  setActiveCompanyId: (id: string | null) => Promise<void>;
  clear: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  hydrated: false,
  accessToken: null,
  refreshToken: null,
  user: null,
  companies: [],
  activeCompanyId: null,

  async hydrate() {
    if (get().hydrated) return;
    const [accessToken, refreshToken, userJson, activeCompanyId] =
      await Promise.all([
        authStorage.getAccess(),
        authStorage.getRefresh(),
        authStorage.getUser(),
        authStorage.getActiveCompany(),
      ]);
    let user: AuthUser | null = null;
    if (userJson) {
      try {
        user = JSON.parse(userJson) as AuthUser;
      } catch {
        user = null;
      }
    }
    set({
      hydrated: true,
      accessToken,
      refreshToken,
      user,
      activeCompanyId,
    });
  },

  async setSession({ accessToken, refreshToken, user }) {
    await Promise.all([
      authStorage.setAccess(accessToken),
      authStorage.setRefresh(refreshToken),
      authStorage.setUser(JSON.stringify(user)),
    ]);
    set({ accessToken, refreshToken, user });
  },

  async setMe({ user, companies }) {
    await authStorage.setUser(JSON.stringify(user));
    const current = get().activeCompanyId;
    const hasCurrent = current && companies.some((c) => c.companyId === current);
    const next =
      hasCurrent ? current : (companies[0]?.companyId ?? null);
    await authStorage.setActiveCompany(next);
    set({
      user,
      companies,
      activeCompanyId: next,
    });
  },

  async setActiveCompanyId(id) {
    await authStorage.setActiveCompany(id);
    set({ activeCompanyId: id });
  },

  async clear() {
    await authStorage.clear();
    set({
      accessToken: null,
      refreshToken: null,
      user: null,
      companies: [],
      activeCompanyId: null,
    });
  },
}));
