import { loginBodySchema, loginResponseSchema, userSchema } from '@wsp/contracts';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { authenticate, currentUser } from '#/plugins/auth';
import { login, logout } from './service';

export const authRoutes: FastifyPluginAsyncZod = async (app) => {
  app.post(
    '/login',
    { schema: { body: loginBodySchema, response: { 200: loginResponseSchema } } },
    async (request) => login(request.body),
  );

  app.post('/logout', { onRequest: authenticate }, async (request, reply) => {
    if (request.authTokenHash) {
      await logout(request.authTokenHash);
    }
    return reply.status(204).send();
  });

  app.get(
    '/me',
    { onRequest: authenticate, schema: { response: { 200: userSchema } } },
    async (request) => currentUser(request),
  );
};
