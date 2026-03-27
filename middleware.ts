import { NextRequest, NextResponse } from 'next/server';

/**
 * Routes under the (dashboard) route group that require a valid session.
 * Add new protected top-level segments here as the app grows.
 */
const PROTECTED_PREFIXES = [
  '/dashboard',
  '/athletes',
  '/classes',
  '/community',
  '/learning',
  '/matches',
  '/membership',
  '/tatami',
  '/techniques',
];

function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + '/'),
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── 1. Server-side auth guard ─────────────────────────────────────────────
  // Redirect unauthenticated requests before React even renders, so the
  // page content is never briefly visible to logged-out users.
  if (isProtected(pathname)) {
    const hasToken = request.cookies.has('flowroll_access');
    if (!hasToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // ── 2. Per-request CSP nonce ───────────────────────────────────────────────
  // A unique nonce per request replaces the blanket 'unsafe-inline' directive,
  // so only scripts that Next.js explicitly marks with this nonce are allowed.
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const isDev = process.env.NODE_ENV === 'development';

  const csp = [
    "default-src 'self'",
    // 'strict-dynamic' allows scripts loaded by the nonce-tagged bootstrap to
    // load further scripts (covers Next.js's dynamic import chunks).
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ''}`,
    // 'unsafe-inline' is still required for style-src because Tailwind and
    // shadcn/ui set inline CSS variables at runtime.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
  ].join('; ');

  // Pass the nonce to the root layout so Next.js can inject it into its own
  // script tags (hydration bootstrap, route prefetching, etc.).
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);

  // ── 3. Authorization header injection for API proxy routes ────────────────
  // Route Handlers (app/api/auth/*) take precedence over rewrites, so they
  // won't accidentally pick up this header.
  if (pathname.startsWith('/api/')) {
    const token = request.cookies.get('flowroll_access')?.value;
    if (token) {
      requestHeaders.set('Authorization', `Bearer ${token}`);
    }
  }

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set('Content-Security-Policy', csp);
  return response;
}

export const config = {
  // Run on every route except Next.js internals and static assets.
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
