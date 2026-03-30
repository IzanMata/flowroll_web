'use client';

import { useQuery } from '@tanstack/react-query';
import type { Technique } from '@/types/api';
import { fetchTechniques } from '../api/fetchTechniques';

export function useTechniques() {
  const { data = [], isLoading, error } = useQuery<Technique[]>({
    queryKey: ['techniques'],
    queryFn: fetchTechniques,
  });

  return { data, isLoading, error };
}
