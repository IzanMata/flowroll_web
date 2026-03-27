'use client';

import { useCallback, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type { Academy, PaginatedResponse } from '@/types/api';
import { AcademyContext } from '@/hooks/useAcademy';

const ACADEMY_KEY = 'flowroll_active_academy';

export function AcademyProvider({ children }: { children: React.ReactNode }) {
  // Read from localStorage synchronously so academyId is available on the
  // first render — prevents the query-disabled flash when academyId is null.
  const [activeAcademy, setActiveAcademyState] = useState<Academy | null>(() => {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(ACADEMY_KEY);
    if (!stored) return null;
    const id = parseInt(stored, 10);
    return isNaN(id) ? null : ({ id } as Academy); // minimal shape; replaced once query resolves
  });

  const { data: academies = [], isLoading } = useQuery<Academy[]>({
    queryKey: ['academies', 'my'],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<Academy>>(
        ENDPOINTS.ACADEMIES.MY_ACADEMIES,
      );
      return data.results;
    },
  });

  // Once the full academy list is available, replace the minimal placeholder
  // with the real Academy object (or fall back to the first academy).
  useEffect(() => {
    if (academies.length === 0) return;
    const stored = localStorage.getItem(ACADEMY_KEY);
    const storedId = stored ? parseInt(stored, 10) : null;
    const match = storedId
      ? (academies.find((a) => a.id === storedId) ?? null)
      : null;
    setActiveAcademyState(match ?? academies[0]);
  }, [academies]);

  const setActiveAcademy = useCallback((academy: Academy) => {
    setActiveAcademyState(academy);
    localStorage.setItem(ACADEMY_KEY, String(academy.id));
  }, []);

  return (
    <AcademyContext.Provider
      value={{ activeAcademy, academies, isLoading, setActiveAcademy }}
    >
      {children}
    </AcademyContext.Provider>
  );
}
