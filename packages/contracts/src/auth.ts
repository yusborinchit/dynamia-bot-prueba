import { z } from 'zod';

export const userSchema = z.object({
  id: z.number().int(),
  email: z.string(),
});

export const loginBodySchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export const loginResponseSchema = z.object({
  token: z.string(),
  user: userSchema,
});

export type User = z.infer<typeof userSchema>;
export type LoginBody = z.infer<typeof loginBodySchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;
