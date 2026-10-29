import { z } from 'zod';

export const connectionStatusSchema = z.enum(['connecting', 'open', 'close']);

export const whatsappStatusSchema = z.object({
  connection: connectionStatusSchema,
  waiting_for_qr: z.boolean(),
  group_configured: z.boolean(),
});

export const whatsappGroupSchema = z.object({
  jid: z.string(),
  subject: z.string(),
  size: z.number().int(),
});

export const whatsappGroupListResponseSchema = z.object({
  data: z.array(whatsappGroupSchema),
});

export type ConnectionStatus = z.infer<typeof connectionStatusSchema>;
export type WhatsappStatus = z.infer<typeof whatsappStatusSchema>;
export type WhatsappGroup = z.infer<typeof whatsappGroupSchema>;
