import { apiFetch } from '@/lib/apiClient';
import { Belt, TechniqueCategory } from '@/types';


export async function fetchBelts(): Promise<Belt[]> {
  return apiFetch<Belt[]>('belts/');
}

export async function fetchBelt(id: string): Promise<Belt> {
  return apiFetch<Belt>(`belts/${id}/`);
}
