import { NextRequest } from 'next/server';

/**
 * Validates that the request's Origin header matches the server's Host.
 *
 * This is a belt-and-suspenders check on top of SameSite=Strict cookies.
 * Returns false (rejected) when the Origin header is absent or mismatched.
 */
export function validateCsrfOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');

  if (!origin || !host) return false;

  try {
    const originHost = new URL(origin).host;
    return originHost === host;
  } catch {
    return false;
  }
}
