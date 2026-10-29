import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { LoginResponse } from '@wsp/contracts';
import { login } from '#/features/auth/api/login';
import { setToken } from '#/lib/api/auth-token';
import { meQueryOptions } from '#/lib/queries/me';

export function useLoginMutation() {
  const queryClient = useQueryClient();

  function handleSuccess(response: LoginResponse) {
    setToken(response.token);
    queryClient.setQueryData(meQueryOptions.queryKey, response.user);
  }

  return useMutation({ mutationFn: login, onSuccess: handleSuccess });
}
