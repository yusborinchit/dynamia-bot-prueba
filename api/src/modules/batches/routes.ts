import { batchListResponseSchema, batchSchema, pendingResponseSchema } from '@wsp/contracts';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { createBatch, listBatches, pendingSummary } from './service';

export const batchRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get('/', { schema: { response: { 200: batchListResponseSchema } } }, async () => ({
    data: await listBatches(),
  }));

  app.get('/pending', { schema: { response: { 200: pendingResponseSchema } } }, async () =>
    pendingSummary(),
  );

  app.post('/', { schema: { response: { 202: batchSchema } } }, async (request, reply) =>
    reply.status(202).send(await createBatch(request.log)),
  );
};
