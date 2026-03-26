import { NextResponse } from 'next/server';
import { getAuthToken, getBackendUrl } from '@/lib/api/cookies';

/**
 * GET /api/auth/me/
 * BFF user profile — reads access token from httpOnly cookie
 * and forwards to Django.
 */
export async function GET() {
  const token = await getAuthToken();

  if (!token) {
    return NextResponse.json({ detail: 'Not authenticated' }, { status: 401 });
  }

  const backendUrl = getBackendUrl();
  const res = await fetch(`${backendUrl}/api/auth/me/`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    return NextResponse.json(
      { detail: 'Unauthorized' },
      { status: res.status },
    );
  }

  const user = await res.json();
  return NextResponse.json(user);
}
