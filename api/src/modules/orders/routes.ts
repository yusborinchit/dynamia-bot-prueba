import {
  idParamsSchema,
  orderDetailSchema,
  orderItemsBodySchema,
  orderListQuerySchema,
  orderListResponseSchema,
} from '@wsp/contracts';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { currentUser } from '#/plugins/auth';
import { approveOrder, getOrder, listOrders, retryOrder, updateOrderItems } from './service';

export const orderRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get(
    '/',
    { schema: { querystring: orderListQuerySchema, response: { 200: orderListResponseSchema } } },
    async (request) => ({ data: await listOrders(request.query) }),
  );

  app.get(
    '/:id',
    { schema: { params: idParamsSchema, response: { 200: orderDetailSchema } } },
    async (request) => getOrder(request.params.id),
  );

  app.put(
    '/:id/items',
    {
      schema: {
        params: idParamsSchema,
        body: orderItemsBodySchema,
        response: { 200: orderDetailSchema },
      },
    },
    async (request) => updateOrderItems(request.params.id, request.body),
  );

  app.post(
    '/:id/approve',
    { schema: { params: idParamsSchema, response: { 200: orderDetailSchema } } },
    async (request) => approveOrder(request.params.id, currentUser(request)),
  );

  app.post(
    '/:id/retry',
    { schema: { params: idParamsSchema, response: { 200: orderDetailSchema } } },
    async (request) => retryOrder(request.params.id, request.log),
  );
};
