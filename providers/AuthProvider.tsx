'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type { AcademyWithRole, TokenObtainRequest } from '@/types/api';

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  email_verified: boolean;
  academies: AcademyWithRole[];
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: TokenObtainRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const ACADEMY_KEY = 'flowroll_active_academy';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Validate session on mount by calling the server — no client-side JWT decode
  useEffect(() => {
    let cancelled = false;
    apiClient
      .get<AuthUser>(ENDPOINTS.AUTH.ME)
      .then(({ data }) => {
        if (!cancelled) setUser(data);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(
    async (credentials: TokenObtainRequest) => {
      // BFF route sets httpOnly cookies and returns the user profile
      const { data } = await apiClient.post<AuthUser>(
        ENDPOINTS.AUTH.TOKEN,
        credentials,
      );
      setUser(data);
      router.push('/dashboard');
    },
    [router],
  );

  const logout = useCallback(async () => {
    await apiClient.post(ENDPOINTS.AUTH.LOGOUT).catch(() => {});
    localStorage.removeItem(ACADEMY_KEY);
    setUser(null);
    router.push('/login');
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthContext must be used inside <AuthProvider>');
  }
  return ctx;
}
