import type { User } from '@wsp/contracts';
import { eq } from 'drizzle-orm';
import type { FastifyInstance, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import { db } from '#/db/client';
import { authTokens, users } from '#/db/schema';
import { HttpError } from '#/lib/http-error';
import { hashToken } from '#/lib/token';

declare module 'fastify' {
  interface FastifyRequest {
    authUser: User | null;
    authTokenHash: string | null;
  }
}

function bearerToken(request: FastifyRequest): string | null {
  const header = request.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return null;
  }
  return header.slice('Bearer '.length).trim() || null;
}

export const authPlugin = fp(async (app: FastifyInstance) => {
  app.decorateRequest('authUser', null);
  app.decorateRequest('authTokenHash', null);
});

export async function authenticate(request: FastifyRequest): Promise<void> {
  const token = bearerToken(request);
  if (!token) {
    throw new HttpError(401, 'No autenticado.');
  }
  const tokenHash = hashToken(token);
  const [row] = await db
    .select({ id: users.id, email: users.email })
    .from(authTokens)
    .innerJoin(users, eq(users.id, authTokens.userId))
    .where(eq(authTokens.tokenHash, tokenHash))
    .limit(1);
  if (!row) {
    throw new HttpError(401, 'No autenticado.');
  }
  request.authUser = row;
  request.authTokenHash = tokenHash;
}

export function currentUser(request: FastifyRequest): User {
  if (!request.authUser) {
    throw new HttpError(401, 'No autenticado.');
  }
  return request.authUser;
}
