import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';

import { ErrorBoundary } from '@/components/feedback/ErrorBoundary';
import { STORAGE_KEYS } from '@/config/app';
import { createAppQueryClient } from '@/lib/queryClient';
import { AuthProvider } from '@/features/auth/context';

/* ---------- Theme ---------- */

type Theme = 'light' | 'dark' | 'system';
interface ThemeCtx {
  theme: Theme;
  setTheme: (t: Theme) => void;
}
const ThemeContext = createContext<ThemeCtx | undefined>(undefined);

function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.theme) as Theme | null;
    return stored ?? 'system';
  });

  useEffect(() => {
    const root = document.documentElement;
    const apply = (mode: 'light' | 'dark') => root.classList.toggle('dark', mode === 'dark');

    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      apply(mq.matches ? 'dark' : 'light');
      const handler = (e: MediaQueryListEvent) => apply(e.matches ? 'dark' : 'light');
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
    apply(theme);
    localStorage.setItem(STORAGE_KEYS.theme, theme);
  }, [theme]);

  const value = useMemo(() => ({ theme, setTheme }), [theme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}

/* ---------- Root providers ---------- */

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createAppQueryClient);

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ErrorBoundary>
            {children}
            <Toaster position="top-right" richColors closeButton />
            {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
          </ErrorBoundary>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}