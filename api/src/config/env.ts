import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(['development', 'production']).default('development'),
    PORT: z.coerce.number().int().min(1).max(65535).default(3000),
    HOST: z.string().default('0.0.0.0'),
    DATABASE_URL: z.url(),
    CORS_ORIGIN: z.url(),
    APP_TIMEZONE: z.string().default('America/Montevideo'),
    WHATSAPP_ENABLED: z
      .enum(['true', 'false'])
      .default('true')
      .transform((value) => value === 'true'),
    WHATSAPP_GROUP_JID: z.string().endsWith('@g.us').optional(),
    DEEPSEEK_API_KEY: z.string().min(1),
    AI_MODEL: z.string().default('deepseek-v4-flash'),
    AI_REASONING: z.enum(['none', 'low', 'medium', 'high']).default('none'),
    AI_CONCURRENCY: z.coerce.number().int().min(1).max(20).default(5),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
