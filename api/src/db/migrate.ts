import { resolve } from 'node:path';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { db, sql } from '#/db/client';

await migrate(db, { migrationsFolder: resolve('drizzle') });
await sql.end();
