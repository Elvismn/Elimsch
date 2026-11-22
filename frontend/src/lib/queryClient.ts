import { QueryClient } from '@tanstack/react-query';
import type { NormalizedError } from '@/types/api';

export function createAppQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          const e = error as NormalizedError;
          if (e?.status >= 400 && e?.status < 500) return false;
          return failureCount < 2;
        },
      },
      mutations: {
        retry: false,
      },
    },
  });
}