import { apiFetch } from '@/lib/api/client';
import type { TechniqueCategory } from '@/types/api';

export async function fetchCategories(): Promise<TechniqueCategory[]> {
  return apiFetch<TechniqueCategory[]>('categories/');
}

export async function fetchCategory(id: number): Promise<TechniqueCategory> {
  return apiFetch<TechniqueCategory>(`categories/${id}/`);
}
