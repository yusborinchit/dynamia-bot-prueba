import { whatsappGroupListResponseSchema, whatsappStatusSchema } from '@wsp/contracts';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { env } from '#/config/env';
import type { WhatsappConnection } from './connection';

export const whatsappRoutes: FastifyPluginAsyncZod<{
  connection: () => WhatsappConnection | null;
}> = async (app, options) => {
  app.get('/status', { schema: { response: { 200: whatsappStatusSchema } } }, async () => {
    const status = options.connection()?.status() ?? {
      connection: 'close' as const,
      waitingForQr: false,
    };
    return {
      connection: status.connection,
      waiting_for_qr: status.waitingForQr,
      group_configured: Boolean(env.WHATSAPP_GROUP_JID),
    };
  });

  app.get(
    '/groups',
    { schema: { response: { 200: whatsappGroupListResponseSchema } } },
    async () => ({ data: (await options.connection()?.groups()) ?? [] }),
  );
};
