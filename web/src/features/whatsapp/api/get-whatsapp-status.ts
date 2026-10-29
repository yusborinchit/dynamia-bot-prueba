import { type WhatsappStatus, whatsappStatusSchema } from '@wsp/contracts';
import { api } from '#/lib/api/client';

export async function getWhatsappStatus(): Promise<WhatsappStatus> {
  return whatsappStatusSchema.parse(await api.get('whatsapp/status').json());
}
