import { z } from 'zod';

export const unitSchema = z.enum(['crate', 'bag', 'kg', 'unit', 'bunch', 'dozen']);

export const productSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  aliases: z.array(z.string()),
});

export const productBodySchema = z.object({
  name: z.string().trim().min(1).max(120),
  aliases: z.array(z.string().trim().min(1).max(120)).default([]),
});

export const productListResponseSchema = z.object({
  data: z.array(productSchema),
});

export type Unit = z.infer<typeof unitSchema>;
export type Product = z.infer<typeof productSchema>;
export type ProductBody = z.infer<typeof productBodySchema>;
