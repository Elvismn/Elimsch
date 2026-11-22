import { useMutation, useQuery } from '@tanstack/react-query';
import { login, me } from './api';
import type { LoginInput } from './schemas';

export const authKeys = {
  all: ['auth'] as const,
  me: () => [...authKeys.all, 'me'] as const,
};

export function useLoginMutation() {
  return useMutation({
    mutationFn: (input: LoginInput) => login(input),
  });
}

/** Used only for a manual revalidation trigger — the provider owns boot rehydration. */
export function useMeQuery(enabled = true) {
  return useQuery({
    queryKey: authKeys.me(),
    queryFn: me,
    enabled,
    staleTime: 5 * 60_000,
  });
}