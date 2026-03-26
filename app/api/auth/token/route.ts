import { NextRequest, NextResponse } from 'next/server';
import {
  getBackendUrl,
  setAuthCookies,
} from '@/lib/api/cookies';

/**
 * POST /api/auth/token/
 * BFF login — forwards credentials to Django, stores tokens in httpOnly
 * cookies, and returns the authenticated user profile.
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const backendUrl = getBackendUrl();

  const tokenRes = await fetch(`${backendUrl}/api/auth/token/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!tokenRes.ok) {
    // Forward the status but always return a generic message
    return NextResponse.json(
      { detail: 'Credenciales incorrectas.' },
      { status: tokenRes.status },
    );
  }

  const { access, refresh } = await tokenRes.json();
  await setAuthCookies(access, refresh);

  // Fetch the user profile so the client never touches the JWT
  const meRes = await fetch(`${backendUrl}/api/auth/me/`, {
    headers: { Authorization: `Bearer ${access}` },
  });

  if (meRes.ok) {
    const user = await meRes.json();
    return NextResponse.json(user);
  }

  return NextResponse.json({ authenticated: true });
}
