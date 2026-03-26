import { apiFetch } from '@/lib/api/client';
import type { Technique } from '@/types/api';

export async function fetchTechniques(): Promise<Technique[]> {
  return apiFetch<Technique[]>('techniques/');
}

export async function fetchTechnique(id: number): Promise<Technique> {
  return apiFetch<Technique>(`techniques/${id}/`);
}
