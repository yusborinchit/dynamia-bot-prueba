import {
  idParamsSchema,
  productBodySchema,
  productListResponseSchema,
  productSchema,
} from '@wsp/contracts';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { createProduct, deleteProduct, listProducts, updateProduct } from './service';

export const productRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get('/', { schema: { response: { 200: productListResponseSchema } } }, async () => ({
    data: await listProducts(),
  }));

  app.post(
    '/',
    { schema: { body: productBodySchema, response: { 201: productSchema } } },
    async (request, reply) => reply.status(201).send(await createProduct(request.body)),
  );

  app.put(
    '/:id',
    {
      schema: {
        params: idParamsSchema,
        body: productBodySchema,
        response: { 200: productSchema },
      },
    },
    async (request) => updateProduct(request.params.id, request.body),
  );

  app.delete('/:id', { schema: { params: idParamsSchema } }, async (request, reply) => {
    await deleteProduct(request.params.id);
    return reply.status(204).send();
  });
};
