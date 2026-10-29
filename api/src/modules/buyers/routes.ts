import {
  buyerListResponseSchema,
  buyerSchema,
  buyerUpdateBodySchema,
  idParamsSchema,
} from '@wsp/contracts';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { listBuyers, updateBuyer } from './service';

export const buyerRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get('/', { schema: { response: { 200: buyerListResponseSchema } } }, async () => ({
    data: await listBuyers(),
  }));

  app.patch(
    '/:id',
    {
      schema: {
        params: idParamsSchema,
        body: buyerUpdateBodySchema,
        response: { 200: buyerSchema },
      },
    },
    async (request) => updateBuyer(request.params.id, request.body),
  );
};
