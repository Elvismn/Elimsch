import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { toast } from 'sonner';
import { STORAGE_KEYS } from '@/config/app';
import { authBus } from '@/lib/authBus';
import type { User } from '@/types/domain';
import * as authApi from './api';

interface AuthContextValue {
  user: User | null;
  isInitializing: boolean;
  isAuthenticated: boolean;
  setSession: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => readCachedUser());
  const [isInitializing, setIsInitializing] = useState(true);
  const userRef = useRef<User | null>(user);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const setSession = useCallback((token: string, u: User) => {
    localStorage.setItem(STORAGE_KEYS.token, token);
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(u));
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.token);
    localStorage.removeItem(STORAGE_KEYS.user);
    setUser(null);
  }, []);

  // Boot: rehydrate via /auth/me if a token exists
  useEffect(() => {
    let cancelled = false;
    const token = localStorage.getItem(STORAGE_KEYS.token);

    if (!token) {
      setIsInitializing(false);
      return;
    }

    // Optimistic paint from cached user (validated below)
    const cached = readCachedUser();
    if (cached) setUser(cached);

    authApi
      .me()
      .then((u) => {
        if (cancelled) return;
        localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(u));
        setUser(u);
      })
      .catch(() => {
        if (cancelled) return;
        localStorage.removeItem(STORAGE_KEYS.token);
        localStorage.removeItem(STORAGE_KEYS.user);
        setUser(null);
      })
      .finally(() => {
        if (!cancelled) setIsInitializing(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // 401 event from Axios interceptor
  useEffect(() => {
    return authBus.onUnauthorized(() => {
      if (!userRef.current) return; // already signed out — avoid duplicate toasts
      logout();
      toast.error('Session expired. Please sign in again.');
    });
  }, [logout]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isInitializing,
      isAuthenticated: Boolean(user),
      setSession,
      logout,
    }),
    [user, isInitializing, setSession, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

function readCachedUser(): User | null {
  const raw = localStorage.getItem(STORAGE_KEYS.user);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}