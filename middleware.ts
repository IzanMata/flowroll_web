import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware that reads the httpOnly auth cookie and injects the
 * Authorization header before Next.js rewrites forward the request
 * to the Django backend.
 *
 * Route Handlers (app/api/auth/*) are matched before rewrites,
 * so they are unaffected by this middleware's header injection.
 */
export function middleware(request: NextRequest) {
  const token = request.cookies.get('flowroll_access')?.value;

  if (token) {
    const headers = new Headers(request.headers);
    headers.set('Authorization', `Bearer ${token}`);
    return NextResponse.next({ request: { headers } });
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
