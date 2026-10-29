import type { LoginBody, LoginResponse } from '@wsp/contracts';
import { eq } from 'drizzle-orm';
import { db } from '#/db/client';
import { authTokens, users } from '#/db/schema';
import { HttpError } from '#/lib/http-error';
import { hashPassword, verifyPassword } from '#/lib/password';
import { generateToken, hashToken } from '#/lib/token';

export async function login(body: LoginBody): Promise<LoginResponse> {
  const email = body.email.toLowerCase();
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user || !(await verifyPassword(body.password, user.passwordHash))) {
    throw new HttpError(422, 'Email o contraseña incorrectos.');
  }
  const token = generateToken();
  await db.insert(authTokens).values({ userId: user.id, tokenHash: hashToken(token) });
  return { token, user: { id: user.id, email: user.email } };
}

export async function logout(tokenHash: string): Promise<void> {
  await db.delete(authTokens).where(eq(authTokens.tokenHash, tokenHash));
}

export async function createUser(email: string, password: string): Promise<void> {
  await db.insert(users).values({
    email: email.toLowerCase(),
    passwordHash: await hashPassword(password),
  });
}
