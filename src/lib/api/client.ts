import Constants from 'expo-constants';
import { useAuthStore } from '@/lib/auth/store';
import type { ApiResponse } from './types';

const FALLBACK_URL = 'http://localhost:3000/api/v1';

function resolveApiUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv && fromEnv.length > 0) return fromEnv;
  const fromExtra = (Constants.expoConfig?.extra as Record<string, unknown> | undefined)
    ?.apiUrl;
  if (typeof fromExtra === 'string' && fromExtra.length > 0) return fromExtra;
  return FALLBACK_URL;
}

const API_URL = resolveApiUrl();

export class ApiCallError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'ApiCallError';
  }
}

export interface ApiCallOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT';
  body?: unknown;
  query?: Record<string, unknown>;
  anonymous?: boolean;
  noCompanyContext?: boolean;
  signal?: AbortSignal;
  headers?: Record<string, string>;
}

function buildUrl(path: string, query?: Record<string, unknown>): string {
  const base = API_URL.endsWith('/') ? API_URL : API_URL + '/';
  const cleaned = path.replace(/^\//, '');
  const url = new URL(cleaned, base);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null && v !== '') {
        url.searchParams.set(k, String(v));
      }
    }
  }
  return url.toString();
}

export async function apiCall<T = unknown>(
  path: string,
  opts: ApiCallOptions = {},
): Promise<T> {
  const url = buildUrl(path, opts.query);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (!opts.anonymous) {
    const { accessToken, activeCompanyId } = useAuthStore.getState();
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
    if (!opts.noCompanyContext && activeCompanyId) {
      headers['X-Company-Id'] = activeCompanyId;
    }
  }

  if (opts.headers) {
    for (const [k, v] of Object.entries(opts.headers)) headers[k] = v;
  }

  const res = await fetch(url, {
    method: opts.method ?? 'GET',
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    signal: opts.signal,
  });

  let parsed: ApiResponse<T> | null = null;
  try {
    parsed =
      res.status === 204
        ? ({ success: true, data: undefined as unknown as T } as ApiResponse<T>)
        : ((await res.json()) as ApiResponse<T>);
  } catch {
    throw new ApiCallError(
      'INTERNAL_ERROR',
      `Resposta inválida do servidor (status ${res.status}).`,
      res.status,
    );
  }

  if (!parsed || parsed.success === false) {
    const e = parsed && parsed.success === false ? parsed.error : undefined;
    throw new ApiCallError(
      e?.code ?? 'INTERNAL_ERROR',
      e?.message ?? 'Erro inesperado.',
      res.status,
      e?.details,
    );
  }

  return parsed.data;
}
