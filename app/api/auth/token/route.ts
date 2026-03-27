import { NextRequest, NextResponse } from 'next/server';
import {
  getBackendUrl,
  setAuthCookies,
} from '@/lib/api/cookies';
import { checkRateLimit } from '@/lib/api/rateLimit';
import { validateCsrfOrigin } from '@/lib/api/csrf';

/**
 * POST /api/auth/token/
 * BFF login — forwards credentials to Django, stores tokens in httpOnly
 * cookies, and returns the authenticated user profile.
 */
export async function POST(request: NextRequest) {
  // ── CSRF origin check ─────────────────────────────────────────────────────
  if (!validateCsrfOrigin(request)) {
    return NextResponse.json(
      { detail: 'Solicitud no permitida.' },
      { status: 403 },
    );
  }

  // ── Rate limiting (per IP) ────────────────────────────────────────────────
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    request.headers.get('x-real-ip') ??
    'unknown';

  const rateLimit = checkRateLimit(ip);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { detail: 'Demasiados intentos. Inténtalo más tarde.' },
      {
        status: 429,
        headers: { 'Retry-After': String(rateLimit.retryAfter) },
      },
    );
  }

  // ── Input validation ──────────────────────────────────────────────────────
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ detail: 'Cuerpo de la solicitud inválido.' }, { status: 400 });
  }

  if (
    typeof body !== 'object' ||
    body === null ||
    typeof (body as Record<string, unknown>).username !== 'string' ||
    typeof (body as Record<string, unknown>).password !== 'string' ||
    !(body as Record<string, unknown>).username ||
    !(body as Record<string, unknown>).password
  ) {
    return NextResponse.json(
      { detail: 'Credenciales incorrectas.' },
      { status: 401 },
    );
  }

  const { username, password } = body as { username: string; password: string };

  // ── Forward to Django ─────────────────────────────────────────────────────
  const backendUrl = getBackendUrl();

  const tokenRes = await fetch(`${backendUrl}/api/auth/token/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (!tokenRes.ok) {
    // Always return 401 regardless of the upstream status code to prevent
    // user enumeration via HTTP status differences.
    return NextResponse.json(
      { detail: 'Credenciales incorrectas.' },
      { status: 401 },
    );
  }

  const { access, refresh } = await tokenRes.json();
  await setAuthCookies(access, refresh);

  // Fetch the user profile so the client never touches the JWT
  const meRes = await fetch(`${backendUrl}/api/auth/me/`, {
    headers: { Authorization: `Bearer ${access}` },
  });

  if (!meRes.ok) {
    await import('@/lib/api/cookies').then((m) => m.clearAuthCookies());
    return NextResponse.json(
      { detail: 'Error al obtener el perfil de usuario.' },
      { status: 502 },
    );
  }

  const user = await meRes.json();
  return NextResponse.json(user);
}
