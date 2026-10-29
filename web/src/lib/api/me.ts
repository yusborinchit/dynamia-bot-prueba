import { type User, userSchema } from '@wsp/contracts';
import { api } from '#/lib/api/client';

export async function me(): Promise<User> {
  return userSchema.parse(await api.get('auth/me').json());
}
