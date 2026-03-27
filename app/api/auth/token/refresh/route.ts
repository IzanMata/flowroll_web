import { NextRequest, NextResponse } from 'next/server';
import {
  clearAuthCookies,
  getBackendUrl,
  getRefreshToken,
  setAuthCookies,
} from '@/lib/api/cookies';
import { validateCsrfOrigin } from '@/lib/api/csrf';

/**
 * POST /api/auth/token/refresh/
 * BFF token refresh — reads refresh token from httpOnly cookie,
 * calls Django, and updates cookies.
 */
export async function POST(request: NextRequest) {
  if (!validateCsrfOrigin(request)) {
    return NextResponse.json(
      { detail: 'Solicitud no permitida.' },
      { status: 403 },
    );
  }

  const refreshToken = await getRefreshToken();

  if (!refreshToken) {
    return NextResponse.json({ detail: 'No refresh token' }, { status: 401 });
  }

  const backendUrl = getBackendUrl();
  const res = await fetch(`${backendUrl}/api/auth/token/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh: refreshToken }),
  });

  if (!res.ok) {
    await clearAuthCookies();
    return NextResponse.json({ detail: 'Refresh failed' }, { status: 401 });
  }

  const data = await res.json();
  await setAuthCookies(data.access, data.refresh ?? refreshToken);

  return NextResponse.json({ ok: true });
}
