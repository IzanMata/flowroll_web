'use client';

import { useAuthContext } from '@/providers/AuthProvider';

/**
 * Access the authenticated user and auth actions.
 * Must be used inside a component wrapped by AuthProvider.
 */
export function useAuth() {
  return useAuthContext();
}
