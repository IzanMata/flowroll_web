import { apiFetch } from '@/lib/apiClient';
import { Technique } from '../types';

export async function fetchTechniques(): Promise<Technique[]> {
  return apiFetch<Technique[]>('techniques/');
}
