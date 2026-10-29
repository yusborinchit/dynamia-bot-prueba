import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import type { ErrorResponse } from '@wsp/contracts';
import Fastify, { type FastifyError, LogController } from 'fastify';
import {
  hasZodFastifySchemaValidationErrors,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod';
import { env } from '#/config/env';
import { HttpError } from '#/lib/http-error';
import { authRoutes } from '#/modules/auth/routes';
import { batchRoutes } from '#/modules/batches/routes';
import { buyerRoutes } from '#/modules/buyers/routes';
import { orderRoutes } from '#/modules/orders/routes';
import { productRoutes } from '#/modules/products/routes';
import type { WhatsappConnection } from '#/modules/whatsapp/connection';
import { whatsappRoutes } from '#/modules/whatsapp/routes';
import { authenticate, authPlugin } from '#/plugins/auth';

const IS_PRODUCTION = env.NODE_ENV === 'production';

function validationErrors(error: FastifyError): ErrorResponse {
  const errors: Record<string, string[]> = {};
  for (const issue of error.validation ?? []) {
    const field = issue.instancePath.replace(/^\//, '').replaceAll('/', '.') || '_';
    errors[field] = [...(errors[field] ?? []), issue.message ?? 'Valor inválido.'];
  }
  return { message: 'Los datos enviados no son válidos.', errors };
}

export async function buildApp(options: { whatsapp: () => WhatsappConnection | null }) {
  const app = Fastify({
    logger: {
      level: 'info',
      transport: IS_PRODUCTION ? undefined : { target: 'pino-pretty', options: { colorize: true } },
    },
    logController: new LogController({ disableRequestLogging: true }),
  });

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  app.setErrorHandler((error: FastifyError, _request, reply) => {
    if (hasZodFastifySchemaValidationErrors(error)) {
      return reply.status(422).send(validationErrors(error));
    }
    if (error instanceof HttpError) {
      return reply.status(error.statusCode).send({ message: error.message });
    }
    if (error.statusCode && error.statusCode < 500) {
      return reply.status(error.statusCode).send({ message: error.message });
    }
    app.log.error(error);
    return reply.status(500).send({ message: 'Error interno del servidor.' });
  });

  app.setNotFoundHandler((_request, reply) =>
    reply.status(404).send({ message: 'No encontrado.' }),
  );

  await app.register(helmet);
  await app.register(cors, {
    origin: env.CORS_ORIGIN,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE'],
  });
  await app.register(authPlugin);

  app.get('/health', async () => ({ status: 'ok' }));

  await app.register(
    async (api) => {
      await api.register(authRoutes, { prefix: '/auth' });
      await api.register(async (protectedApi) => {
        protectedApi.addHook('onRequest', authenticate);
        await protectedApi.register(productRoutes, { prefix: '/products' });
        await protectedApi.register(buyerRoutes, { prefix: '/buyers' });
        await protectedApi.register(batchRoutes, { prefix: '/batches' });
        await protectedApi.register(orderRoutes, { prefix: '/orders' });
        await protectedApi.register(whatsappRoutes, {
          prefix: '/whatsapp',
          connection: options.whatsapp,
        });
      });
    },
    { prefix: '/api/v1' },
  );

  return app;
}
