import { parseArgs } from 'node:util';
import { z } from 'zod';
import { sql } from '#/db/client';
import { createUser } from '#/modules/auth/service';

const { values } = parseArgs({
  options: {
    email: { type: 'string' },
    password: { type: 'string' },
  },
});

const input = z.object({ email: z.email(), password: z.string().min(8) }).parse(values);

await createUser(input.email, input.password);
console.info(`Usuario creado: ${input.email}`);
await sql.end();
