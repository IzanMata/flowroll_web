import { NextRequest, NextResponse } from 'next/server';
import { setAuthCookies, getBackendUrl } from '@/lib/api/cookies';

/**
 * GET /api/auth/social/google/callback/
 * BFF callback — Django redirects here after successful Google OAuth with
 * `?access=<JWT>&refresh=<JWT>` query params (set by django-allauth +
 * dj-rest-auth with JWT support).
 * Stores tokens as httpOnly cookies and redirects to the dashboard.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  const access = searchParams.get('access');
  const refresh = searchParams.get('refresh');

  if (!access || !refresh) {
    // Django may have sent an error — redirect to login with a flag
    const loginUrl = new URL('/login', origin);
    loginUrl.searchParams.set('error', 'google_auth_failed');
    return NextResponse.redirect(loginUrl.toString());
  }

  // Validate tokens with the backend before accepting them
  const backendUrl = getBackendUrl();
  const meRes = await fetch(`${backendUrl}/api/auth/me/`, {
    headers: { Authorization: `Bearer ${access}` },
  });

  if (!meRes.ok) {
    const loginUrl = new URL('/login', origin);
    loginUrl.searchParams.set('error', 'google_auth_failed');
    return NextResponse.redirect(loginUrl.toString());
  }

  await setAuthCookies(access, refresh);
  return NextResponse.redirect(`${origin}/`);
}
