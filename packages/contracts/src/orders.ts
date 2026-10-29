import { z } from 'zod';
import { timestampSchema } from './common';
import { unitSchema } from './products';

export const orderStatusSchema = z.enum(['processing', 'draft', 'failed', 'approved']);

export const confidenceSchema = z.enum(['high', 'medium', 'low']);

export const orderItemSchema = z.object({
  id: z.number().int(),
  product_id: z.number().int().nullable(),
  product_name: z.string().nullable(),
  raw_text: z.string(),
  quantity: z.number(),
  unit: unitSchema,
  confidence: confidenceSchema.nullable(),
});

export const orderMessageSchema = z.object({
  id: z.number().int(),
  kind: z.enum(['text', 'media']),
  body: z.string().nullable(),
  quoted_body: z.string().nullable(),
  sent_at: timestampSchema,
});

export const orderSummarySchema = z.object({
  id: z.number().int(),
  buyer: z.object({ id: z.number().int(), name: z.string() }),
  status: orderStatusSchema,
  has_unprocessed_media: z.boolean(),
  item_count: z.number().int(),
  unknown_count: z.number().int(),
  error: z.string().nullable(),
  items: z.array(orderItemSchema),
  created_at: timestampSchema,
  approved_at: timestampSchema.nullable(),
});

export const orderDetailSchema = orderSummarySchema.extend({
  messages: z.array(orderMessageSchema),
});

export const orderListQuerySchema = z.object({
  status: orderStatusSchema.optional(),
});

export const orderListResponseSchema = z.object({
  data: z.array(orderSummarySchema),
});

export const orderItemsBodySchema = z.object({
  items: z.array(
    z.object({
      product_id: z.number().int().positive().nullable(),
      raw_text: z.string().trim().min(1).max(200),
      quantity: z.number().positive(),
      unit: unitSchema,
    }),
  ),
});

export type OrderStatus = z.infer<typeof orderStatusSchema>;
export type Confidence = z.infer<typeof confidenceSchema>;
export type OrderItem = z.infer<typeof orderItemSchema>;
export type OrderMessage = z.infer<typeof orderMessageSchema>;
export type OrderSummary = z.infer<typeof orderSummarySchema>;
export type OrderDetail = z.infer<typeof orderDetailSchema>;
export type OrderListQuery = z.infer<typeof orderListQuerySchema>;
export type OrderItemsBody = z.infer<typeof orderItemsBodySchema>;
