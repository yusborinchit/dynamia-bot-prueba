import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { logout } from '#/features/auth/api/logout';
import { clearToken } from '#/lib/api/auth-token';

export function useLogoutMutation() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  async function handleSettled() {
    clearToken();
    queryClient.clear();
    await navigate({ to: '/login' });
  }

  return useMutation({ mutationFn: logout, onSettled: handleSettled });
}
