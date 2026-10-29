import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '#/config/env';
import * as schema from '#/db/schema';

export const sql = postgres(env.DATABASE_URL);

export const db = drizzle(sql, { schema, casing: 'snake_case' });

export type Db = typeof db;
export type Tx = Parameters<Parameters<Db['transaction']>[0]>[0];
