import { buildApp } from '#/app';
import { env } from '#/config/env';
import { sql } from '#/db/client';
import { recoverInterruptedWork } from '#/modules/batches/processing';
import { startWhatsapp, type WhatsappConnection } from '#/modules/whatsapp/connection';

let whatsapp: WhatsappConnection | null = null;

const app = await buildApp({ whatsapp: () => whatsapp });

await recoverInterruptedWork();

if (env.WHATSAPP_ENABLED) {
  whatsapp = startWhatsapp(app.log, env.WHATSAPP_GROUP_JID);
}

async function shutdown(signal: string): Promise<void> {
  app.log.info({ signal }, 'Shutting down');
  whatsapp?.stop();
  await app.close();
  await sql.end();
  process.exit(0);
}

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));

await app.listen({ port: env.PORT, host: env.HOST });
