import { NextResponse } from 'next/server';
import { clearAuthCookies } from '@/lib/api/cookies';

/**
 * POST /api/auth/logout/
 * BFF logout — clears auth cookies.
 */
export async function POST() {
  await clearAuthCookies();
  return NextResponse.json({ ok: true });
}
