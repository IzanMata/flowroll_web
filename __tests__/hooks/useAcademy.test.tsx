import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAcademy, useAcademyId, AcademyContext } from '@/hooks/useAcademy';
import type { AcademyContextValue } from '@/hooks/useAcademy';
import React from 'react';

const academy = { id: 5, name: 'Test Academy', owner: 1 };

const makeWrapper = (value: AcademyContextValue) => {
  return ({ children }: { children: React.ReactNode }) => (
    <AcademyContext.Provider value={value}>{children}</AcademyContext.Provider>
  );
};

describe('useAcademy', () => {
  it('returns context value when inside provider', () => {
    const value: AcademyContextValue = {
      activeAcademy: academy,
      academies: [academy],
      isLoading: false,
      setActiveAcademy: () => {},
    };
    const { result } = renderHook(() => useAcademy(), { wrapper: makeWrapper(value) });
    expect(result.current.activeAcademy).toEqual(academy);
    expect(result.current.academies).toHaveLength(1);
    expect(result.current.isLoading).toBe(false);
  });

  it('throws when used outside provider', () => {
    expect(() => renderHook(() => useAcademy())).toThrow(
      'useAcademy must be used inside <AcademyProvider>'
    );
  });
});

describe('useAcademyId', () => {
  it('returns active academy id', () => {
    const value: AcademyContextValue = {
      activeAcademy: academy,
      academies: [academy],
      isLoading: false,
      setActiveAcademy: () => {},
    };
    const { result } = renderHook(() => useAcademyId(), { wrapper: makeWrapper(value) });
    expect(result.current).toBe(5);
  });

  it('returns null when no active academy', () => {
    const value: AcademyContextValue = {
      activeAcademy: null,
      academies: [],
      isLoading: false,
      setActiveAcademy: () => {},
    };
    const { result } = renderHook(() => useAcademyId(), { wrapper: makeWrapper(value) });
    expect(result.current).toBeNull();
  });
});
