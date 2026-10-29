import { api } from '#/lib/api/client';

export async function logout(): Promise<void> {
  await api.post('auth/logout');
}
