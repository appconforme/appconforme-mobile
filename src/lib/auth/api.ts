import { apiCall } from '@/lib/api/client';
import type { AuthCompany, AuthUser } from '@/lib/api/types';

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface MeResponse {
  user: AuthUser;
  companies: AuthCompany[];
}

export const authApi = {
  login: (input: LoginInput) =>
    apiCall<LoginResponse>('auth/login', {
      method: 'POST',
      body: input,
      anonymous: true,
    }),

  me: () =>
    apiCall<MeResponse>('auth/me', {
      noCompanyContext: true,
    }),

  refresh: (refreshToken: string) =>
    apiCall<LoginResponse>('auth/refresh', {
      method: 'POST',
      body: { refreshToken },
      anonymous: true,
    }),

  logout: () =>
    apiCall<{ ok: true }>('auth/logout', {
      method: 'POST',
      noCompanyContext: true,
    }).catch(() => ({ ok: true as const })),
};
