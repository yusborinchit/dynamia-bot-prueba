import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    server: 'src/server.ts',
    migrate: 'src/db/migrate.ts',
    seed: 'src/db/seed.ts',
    'create-user': 'src/scripts/create-user.ts',
  },
  format: 'esm',
  target: 'node24',
  platform: 'node',
  clean: true,
  noExternal: ['@wsp/contracts'],
});
