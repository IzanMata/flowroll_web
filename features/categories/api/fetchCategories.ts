import { apiFetch } from '@/lib/apiClient';
import { TechniqueCategory } from '@/types/technique';

export async function fetchCategories(): Promise<TechniqueCategory[]> {
  return apiFetch<TechniqueCategory[]>('categories/');
}

export async function fetchCategory(id: string): Promise<TechniqueCategory> {
  return apiFetch<TechniqueCategory>(`categories/${id}/`);
}
