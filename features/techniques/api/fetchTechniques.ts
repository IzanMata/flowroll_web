import { apiFetch } from '@/lib/apiClient';
import { Technique } from '@/types/technique';

export async function fetchTechniques(): Promise<Technique[]> {
  return apiFetch<Technique[]>('techniques/');
}

export async function fetchTechnique(id: string): Promise<Technique> {
  return apiFetch<Technique>(`techniques/${id}/`);
}
