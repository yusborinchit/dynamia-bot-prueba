import { type LoginBody, type LoginResponse, loginResponseSchema } from '@wsp/contracts';
import { apiError } from '#/lib/api/api-error';
import { api } from '#/lib/api/client';

export async function login(body: LoginBody): Promise<LoginResponse> {
  try {
    return loginResponseSchema.parse(await api.post('auth/login', { json: body }).json());
  } catch (error) {
    throw apiError(error, 'No pudimos iniciar sesión.');
  }
}
