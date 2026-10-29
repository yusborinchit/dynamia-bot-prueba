# prueba-wsp-bot / api

Backend Node + Fastify en TypeScript estricto, con Postgres vía Drizzle y el Vercel AI SDK.
Hereda las restricciones de `../AGENTS.md`. Repo de referencia para estructura y plugins:
`~/dev/yusborinchit/kdet/api` (Fastify + Drizzle + Postgres + `fastify-type-provider-zod` +
`@t3-oss/env-core`).

## Skills

- `$fastify-best-practices` para rutas, plugins, hooks, errores, logging y deploy. Donde la skill
  usa JSON Schema o TypeBox, acá se usa Zod con `fastify-type-provider-zod`.
- `$ai-sdk` para todo código que use el paquete `ai`. Verificar cada API contra los docs
  instalados en `node_modules/ai/docs/`, no de memoria. No se usa el AI Gateway de Vercel: el
  proveedor se conecta directo (`@ai-sdk/deepseek`) con su propia key.

## Arquitectura

- Es un proceso residente: mantiene abierta la conexión con WhatsApp. No asumir un entorno
  serverless ni hosting compartido.
- Se despliega como imagen Docker en un VPS. Toda configuración entra por variables de entorno,
  validadas con Zod al arrancar; si falta una, el proceso no levanta. Nada depende de archivos
  locales que no sobrevivan a un redeploy.
- Las rutas usan los schemas de `packages/contracts` como schema de Fastify (type provider de
  Zod), así request y response quedan validados y tipados sin declarar tipos a mano.
- Acceso a datos solo con Drizzle. Los cambios de schema van por migraciones generadas con
  `drizzle-kit generate`, nunca `push` contra una base que no sea local.
- Todo dato externo se valida con Zod antes de usarse: requests, eventos de WhatsApp y respuestas
  de la IA. La salida de la IA nunca se usa sin pasar por su schema.
- Toda ruta vive bajo `/api/v1`. Las rutas validan entrada y salida con schema y delegan en casos
  de uso; no llevan lógica de negocio.
- WhatsApp entra y sale por un único módulo adaptador. Ningún otro módulo importa Baileys: así la
  conexión se puede reemplazar (por ejemplo, por la Cloud API oficial) sin tocar el dominio.
- La IA se usa a través del Vercel AI SDK. El modelo se elige en un único módulo de
  configuración; el dominio recibe el modelo ya armado y nunca importa un paquete de proveedor
  (`@ai-sdk/*`) directamente. La extracción de pedidos usa salida estructurada con schema Zod.
- El procesamiento de mensajes entrantes debe ser idempotente: WhatsApp puede reentregar eventos y
  la conexión puede reconectarse en cualquier momento.
- El estado de sesión de WhatsApp vive en Postgres, nunca en archivos (no usar
  `useMultiFileAuthState`). Es un secreto: no va al repo, a logs ni a respuestas de la API.
- El front corre en otro dominio (cPanel): CORS habilitado solo para su origin, configurado por
  variable de entorno.
- Logs mínimos con el logger de Fastify (Pino): errores, cambios de estado de la conexión con
  WhatsApp y resumen de cada procesamiento en lote. Nunca contenido de mensajes, números de
  teléfono ni datos de compradores. No loguear cada request ni cada mensaje recibido.
- Auth con email y contraseña y bearer token. Sin roles ni permisos: toda ruta salvo login exige
  usuario autenticado. Contraseñas hasheadas (nunca en claro ni en logs) y sin registro público.
- Usar solo el paquete oficial `baileys` (WhiskeySockets). No instalar forks ni paquetes
  "anti-ban" de terceros: algunos se publicaron para robar sesiones y mensajes.
- Al proveedor de IA solo se le manda el texto de los mensajes y el catálogo. Nunca números de
  teléfono ni nombres de compradores.
- La IA propone y una persona aprueba. Ningún pedido pasa a estado aprobado ni se exporta sin
  acción humana.

## Comandos

```bash
docker compose up -d                 # Postgres de desarrollo (desde la raíz)
pnpm dev                             # api en modo watch
pnpm db:generate                     # migración nueva a partir de src/db/schema.ts
pnpm db:migrate                      # aplicar migraciones
pnpm db:seed                         # catálogo inicial
pnpm user:create --email x --password y
pnpm ai:try --batch 2 [--buyer 4] [--model deepseek-v4-pro]   # probar la IA sin escribir en la base
pnpm typecheck
pnpm build
```

Desde la raíz: `pnpm check` / `pnpm format` (Biome) y `pnpm typecheck` (todo el workspace).

## Operación

- Primer arranque: con `WHATSAPP_ENABLED=true` el QR sale en la consola (o en `docker compose logs api`).
  Se escanea desde el teléfono del número dedicado. Después, `GET /api/v1/whatsapp/groups` lista
  los grupos para copiar el `jid` a `WHATSAPP_GROUP_JID` y reiniciar.
- Producción: Coolify con build pack Docker Compose sobre `docker-compose.prod.yml`; las
  variables se cargan en Coolify. Las migraciones corren al arrancar el contenedor. Desde la
  terminal del contenedor de la api: `node dist/seed.js` para el catálogo y
  `node dist/create-user.js --email x --password y` para usuarios.
- Errores de la API: `{ message, errors? }`, con `errors` por campo en los 422 de validación.

## Verificación

- No agregar tests automatizados.
- Ejecutar lint y typecheck sobre lo modificado.
- Verificar el flujo real: mensaje del grupo guardado, procesamiento del lote, revisión y consumo desde el front.
