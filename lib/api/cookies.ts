import { cookies } from 'next/headers';

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://127.0.0.1:8000';

const COOKIE_DEFAULTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
};

export const COOKIE_NAMES = {
  ACCESS: 'flowroll_access',
  REFRESH: 'flowroll_refresh',
} as const;

export function getBackendUrl(): string {
  return BACKEND_URL;
}

export async function setAuthCookies(access: string, refresh: string) {
  const store = await cookies();
  store.set(COOKIE_NAMES.ACCESS, access, {
    ...COOKIE_DEFAULTS,
    maxAge: 60 * 30, // 30 min — match Django access token lifetime
  });
  store.set(COOKIE_NAMES.REFRESH, refresh, {
    ...COOKIE_DEFAULTS,
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function clearAuthCookies() {
  const store = await cookies();
  store.delete(COOKIE_NAMES.ACCESS);
  store.delete(COOKIE_NAMES.REFRESH);
}

export async function getAuthToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(COOKIE_NAMES.ACCESS)?.value;
}

export async function getRefreshToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(COOKIE_NAMES.REFRESH)?.value;
}
