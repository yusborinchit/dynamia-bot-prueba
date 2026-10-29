import { parseArgs } from 'node:util';
import { and, eq, isNull } from 'drizzle-orm';
import { z } from 'zod';
import { createExtractionModel } from '#/config/ai';
import { env } from '#/config/env';
import { db, sql } from '#/db/client';
import { messages } from '#/db/schema';
import { conversationOf, loadCatalog } from '#/modules/batches/processing';
import { extractOrder } from '#/modules/extraction/extract-order';

const { values } = parseArgs({
  options: {
    batch: { type: 'string' },
    buyer: { type: 'string' },
    model: { type: 'string' },
  },
});

const input = z
  .object({
    batch: z.coerce.number().int().positive(),
    buyer: z.coerce.number().int().positive().optional(),
    model: z.string().default(env.AI_MODEL),
  })
  .parse(values);

const model = createExtractionModel(input.model);
const catalog = await loadCatalog();
const names = new Map(catalog.map((entry) => [entry.id, entry.name]));

const buyerRows = await db
  .selectDistinct({ buyerId: messages.buyerId })
  .from(messages)
  .where(
    and(
      eq(messages.batchId, input.batch),
      isNull(messages.deletedAt),
      input.buyer ? eq(messages.buyerId, input.buyer) : undefined,
    ),
  );

console.info(`Modelo: ${input.model} · compradores: ${buyerRows.length}\n`);

for (const { buyerId } of buyerRows) {
  const { lines } = await conversationOf(input.batch, buyerId);
  if (lines.length === 0) {
    continue;
  }
  const started = Date.now();
  const items = await extractOrder({ model, catalog, lines });
  console.info(`── Comprador ${buyerId} (${Date.now() - started} ms)`);
  for (const line of lines) {
    console.info(`   ${line.time}  ${line.body}${line.quoted ? `  (cita: ${line.quoted})` : ''}`);
  }
  for (const item of items) {
    const product = item.product_id ? names.get(item.product_id) : '¿NO RECONOCIDO?';
    console.info(
      `   → ${item.quantity} ${item.unit} · ${product} · "${item.raw_text}" · ${item.confidence}`,
    );
  }
  console.info('');
}

await sql.end();
