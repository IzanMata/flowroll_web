import { apiFetch } from '@/lib/api/client';
import type { Belt } from '@/types/api';

export async function fetchBelts(): Promise<Belt[]> {
  return apiFetch<Belt[]>('belts/');
}

export async function fetchBelt(id: number): Promise<Belt> {
  return apiFetch<Belt>(`belts/${id}/`);
}
