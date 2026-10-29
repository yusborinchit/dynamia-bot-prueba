import { z } from 'zod';
import { timestampSchema } from './common';

export const buyerSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  wa_name: z.string().nullable(),
  display_name: z.string().nullable(),
  phone: z.string().nullable(),
  created_at: timestampSchema,
});

export const buyerUpdateBodySchema = z.object({
  display_name: z.string().trim().min(1).max(120).nullable(),
});

export const buyerListResponseSchema = z.object({
  data: z.array(buyerSchema),
});

export type Buyer = z.infer<typeof buyerSchema>;
export type BuyerUpdateBody = z.infer<typeof buyerUpdateBodySchema>;
