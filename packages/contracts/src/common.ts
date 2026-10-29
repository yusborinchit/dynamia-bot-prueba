import { z } from 'zod';

z.config(z.locales.es());

export const idParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const errorResponseSchema = z.object({
  message: z.string(),
  errors: z.record(z.string(), z.array(z.string())).optional(),
});

export const timestampSchema = z.iso.datetime({ offset: true });

export type IdParams = z.infer<typeof idParamsSchema>;
export type ErrorResponse = z.infer<typeof errorResponseSchema>;
