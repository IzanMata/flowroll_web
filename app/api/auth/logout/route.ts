import { NextRequest, NextResponse } from 'next/server';
import { clearAuthCookies } from '@/lib/api/cookies';
import { validateCsrfOrigin } from '@/lib/api/csrf';

/**
 * POST /api/auth/logout/
 * BFF logout — clears auth cookies.
 */
export async function POST(request: NextRequest) {
  if (!validateCsrfOrigin(request)) {
    return NextResponse.json(
      { detail: 'Solicitud no permitida.' },
      { status: 403 },
    );
  }

  await clearAuthCookies();
  return NextResponse.json({ ok: true });
}
