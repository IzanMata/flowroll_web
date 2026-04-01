import type { User } from '@/types/api';

/**
 * Returns "Nombre Apellido" when available, falls back to username.
 */
export function getFullName(user: User): string {
  return (
    [user.first_name, user.last_name].filter(Boolean).join(' ') || user.username
  );
}
