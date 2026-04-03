import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/api/cookies';

/**
 * GET /api/auth/social/google/
 * BFF initiator — redirects the browser to Django's Google OAuth entry point.
 * Django (django-allauth) handles the Google redirect, then sends the user
 * back to our /api/auth/social/google/callback/ BFF route with the JWT pair
 * as `?access=<token>&refresh=<token>` query params.
 */
export async function GET(request: NextRequest) {
  const { origin } = new URL(request.url);
  const callbackUrl = `${origin}/api/auth/social/google/callback/`;

  const backendUrl = getBackendUrl();
  const googleAuthUrl = new URL(`${backendUrl}/api/auth/social/google/`);
  googleAuthUrl.searchParams.set('next', callbackUrl);

  return NextResponse.redirect(googleAuthUrl.toString());
}
