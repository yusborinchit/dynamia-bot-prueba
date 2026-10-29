import { HTTPError } from 'ky';
import { z } from 'zod';

const errorBodySchema = z.object({
  message: z.string(),
  errors: z.record(z.string(), z.array(z.string())).optional(),
});

export class ApiError extends Error {
  override name = 'ApiError';
  fieldErrors: Record<string, Array<string>>;

  constructor(message: string, fieldErrors: Record<string, Array<string>>) {
    super(message);
    this.fieldErrors = fieldErrors;
  }
}

export function apiError(error: unknown, fallback: string): ApiError {
  if (!(error instanceof HTTPError)) return new ApiError(fallback, {});

  const body = errorBodySchema.safeParse(error.data);
  if (!body.success) return new ApiError(fallback, {});

  const fieldErrors = body.data.errors ?? {};
  const message = Object.values(fieldErrors)[0]?.[0] ?? body.data.message;

  return new ApiError(message, fieldErrors);
}

export function apiFieldMessages(error: unknown): Array<string> {
  if (!(error instanceof ApiError)) return [];

  return Object.values(error.fieldErrors).flat();
}
