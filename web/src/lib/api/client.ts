import ky from 'ky';
import { env } from '#/env';
import { clearToken, getToken } from '#/lib/api/auth-token';

export const api = ky.create({
  prefix: `${env.VITE_API_URL}/api/v1`,
  headers: { Accept: 'application/json' },
  hooks: {
    beforeRequest: [
      ({ request }) => {
        const token = getToken();
        if (token) request.headers.set('Authorization', `Bearer ${token}`);
      },
    ],
    afterResponse: [
      ({ response }) => {
        if (response.status === 401) clearToken();
      },
    ],
  },
});
