import { z } from 'zod';
import { timestampSchema } from './common';

export const batchStatusSchema = z.enum(['processing', 'done']);

export const batchSchema = z.object({
  id: z.number().int(),
  status: batchStatusSchema,
  message_count: z.number().int(),
  order_count: z.number().int(),
  failed_count: z.number().int(),
  created_at: timestampSchema,
  finished_at: timestampSchema.nullable(),
});

export const batchListResponseSchema = z.object({
  data: z.array(batchSchema),
});

export const pendingResponseSchema = z.object({
  pending_messages: z.number().int(),
  pending_buyers: z.number().int(),
});

export type BatchStatus = z.infer<typeof batchStatusSchema>;
export type Batch = z.infer<typeof batchSchema>;
export type PendingResponse = z.infer<typeof pendingResponseSchema>;
