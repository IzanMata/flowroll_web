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
import { clearTokens, getAccessToken, hasTokens, setTokens } from '@/lib/auth/tokens';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type { TokenObtainRequest, TokenPair } from '@/types/api';

export interface AuthUser {
  id: number;
  username: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: TokenObtainRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function decodeJwtPayload(token: string): { user_id: number } | null {
  try {
    const payload = token.split('.')[1];
    const padded = payload + '='.repeat((4 - (payload.length % 4)) % 4);
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

const USERNAME_KEY = 'flowroll_username';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = getAccessToken();
    if (token && hasTokens()) {
      const payload = decodeJwtPayload(token);
      const username = localStorage.getItem(USERNAME_KEY) ?? 'usuario';
      if (payload) {
        setUser({ id: payload.user_id, username });
      } else {
        clearTokens();
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(
    async (credentials: TokenObtainRequest) => {
      const { data } = await apiClient.post<TokenPair>(
        ENDPOINTS.AUTH.TOKEN,
        credentials,
      );
      setTokens(data.access, data.refresh);

      const payload = decodeJwtPayload(data.access);
      const newUser: AuthUser = {
        id: payload?.user_id ?? 0,
        username: credentials.username,
      };
      localStorage.setItem(USERNAME_KEY, credentials.username);
      setUser(newUser);
      router.push('/dashboard');
    },
    [router],
  );

  const logout = useCallback(() => {
    clearTokens();
    localStorage.removeItem(USERNAME_KEY);
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
