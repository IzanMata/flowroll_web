'use client';

import { createContext, useContext } from 'react';
import type { Academy } from '@/types/api';

export interface AcademyContextValue {
  activeAcademy: Academy | null;
  academies: Academy[];
  isLoading: boolean;
  setActiveAcademy: (academy: Academy) => void;
}

export const AcademyContext = createContext<AcademyContextValue | null>(null);

export function useAcademy(): AcademyContextValue {
  const ctx = useContext(AcademyContext);
  if (!ctx) {
    throw new Error('useAcademy must be used inside <AcademyProvider>');
  }
  return ctx;
}

export function useAcademyId(): number | null {
  const { activeAcademy } = useAcademy();
  return activeAcademy?.id ?? null;
}
