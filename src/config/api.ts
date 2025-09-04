import Constants from 'expo-constants';

// Resolve backend base URL from Expo extra or infer from host (useful on Expo Go)
const EXTRA = (Constants.expoConfig?.extra as any) || {};

function inferHostFromExpo(): string | null {
  // Try to infer LAN host used by Expo dev server (works in Expo Go)
  // hostUri examples: 192.168.1.25:19000, 192.168.1.25:8081
  // debuggerHost examples (older): 192.168.1.25:19000
  const hostUri: string | undefined = (Constants as any)?.expoConfig?.hostUri;
  const debuggerHost: string | undefined = (Constants as any)?.manifest?.debuggerHost;
  const raw = hostUri || debuggerHost;
  if (!raw) return null;
  const host = raw.split(':')[0];
  if (!host) return null;
  return host;
}

function inferBaseUrl(): string {
  const override: string | undefined = EXTRA.BACKEND_URL;
  if (override) return override;
  const host = inferHostFromExpo();
  if (host) {
    // Default backend port
    return `http://${host}:3000`;
  }
  return '';
}

export const API = {
  baseUrl: inferBaseUrl(),
  endpoints: {
    buyers: {
      list: '/buyers',
    },
    calls: {
      list: '/calls',
      create: '/calls',
      update: (id: string) => `/calls/${id}`,
    },
    crops: {
      list: '/crops',
      create: '/crops',
      update: (id: string) => `/crops/${id}`,
      remove: (id: string) => `/crops/${id}`,
      ready: '/crops/ready',
    },
    transactions: {
      list: '/transactions',
      create: '/transactions',
      update: (id: string) => `/transactions/${id}`,
      status: (id: string) => `/transactions/${id}/status`,
    },
  },
} as const;

export const setApiBaseUrl = (url: string) => {
  API.baseUrl = url || '';
};

export const buildApiUrl = (path: string): string => {
  if (!API.baseUrl) return path; // allow absolute URLs during development
  return `${API.baseUrl}${path}`;
};

const DEFAULT_TIMEOUT_MS = 30000;
const DEFAULT_RETRY_ATTEMPTS = 2;

export type ApiRequestInit = RequestInit & {
  timeoutMs?: number;
  retryAttempts?: number;
};

export const apiFetch = async (path: string, init: ApiRequestInit = {}): Promise<Response> => {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, retryAttempts = DEFAULT_RETRY_ATTEMPTS, headers, ...rest } = init;
  const url = buildApiUrl(path);

  let lastError: unknown;
  for (let attempt = 0; attempt <= retryAttempts; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(url, {
        ...rest,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...(headers || {}),
        },
        signal: controller.signal,
      });
      clearTimeout(timer);
      return res;
    } catch (err) {
      clearTimeout(timer);
      lastError = err;
      if (attempt === retryAttempts) break;
      await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Network error');
};

export const getJson = async <T>(path: string): Promise<T> => {
  const res = await apiFetch(path, { method: 'GET' });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.message || 'Request failed');
  return json as T;
};

export const postJson = async <TBody extends object, TResp = unknown>(path: string, body: TBody): Promise<TResp> => {
  const res = await apiFetch(path, { method: 'POST', body: JSON.stringify(body) });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.message || 'Request failed');
  return json as TResp;
};

export default API;
