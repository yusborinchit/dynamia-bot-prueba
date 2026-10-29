import { and, asc, eq, isNull } from 'drizzle-orm';
import type { FastifyBaseLogger } from 'fastify';
import pLimit from 'p-limit';
import { extractionModel } from '#/config/ai';
import { env } from '#/config/env';
import { db } from '#/db/client';
import { batches, messages, orderItems, orders } from '#/db/schema';
import { extractOrder } from '#/modules/extraction/extract-order';
import type { CatalogEntry, ConversationLine } from '#/modules/extraction/prompt';
import { listProducts } from '#/modules/products/service';

const timeFormat = new Intl.DateTimeFormat('es-UY', {
  timeZone: env.APP_TIMEZONE,
  weekday: 'short',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

export async function loadCatalog(): Promise<CatalogEntry[]> {
  return listProducts();
}

export async function conversationOf(batchId: number, buyerId: number) {
  const rows = await db
    .select()
    .from(messages)
    .where(
      and(eq(messages.batchId, batchId), eq(messages.buyerId, buyerId), isNull(messages.deletedAt)),
    )
    .orderBy(asc(messages.sentAt));
  const lines: ConversationLine[] = rows
    .filter((row) => row.body)
    .map((row) => ({
      time: timeFormat.format(row.sentAt),
      body: row.body ?? '',
      quoted: row.quotedBody,
    }));
  return { lines, hasMedia: rows.some((row) => row.kind === 'media') };
}

function errorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : 'Error desconocido';
  return message.slice(0, 300);
}

export async function processOrder(orderId: number, catalog: CatalogEntry[]): Promise<boolean> {
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
  if (!order) {
    return true;
  }
  const { lines, hasMedia } = await conversationOf(order.batchId, order.buyerId);

  if (lines.length === 0 && !hasMedia) {
    await db.delete(orders).where(eq(orders.id, orderId));
    return true;
  }

  try {
    const items =
      lines.length === 0 ? [] : await extractOrder({ model: extractionModel, catalog, lines });
    if (items.length === 0 && !hasMedia) {
      await db.delete(orders).where(eq(orders.id, orderId));
      return true;
    }
    await db.transaction(async (tx) => {
      await tx.delete(orderItems).where(eq(orderItems.orderId, orderId));
      if (items.length > 0) {
        await tx.insert(orderItems).values(
          items.map((item) => ({
            orderId,
            productId: item.product_id,
            rawText: item.raw_text,
            quantity: item.quantity,
            unit: item.unit,
            confidence: item.confidence,
          })),
        );
      }
      await tx
        .update(orders)
        .set({ status: 'draft', hasUnprocessedMedia: hasMedia, error: null })
        .where(eq(orders.id, orderId));
    });
    return true;
  } catch (error) {
    await db
      .update(orders)
      .set({ status: 'failed', hasUnprocessedMedia: hasMedia, error: errorMessage(error) })
      .where(eq(orders.id, orderId));
    return false;
  }
}

export async function runBatch(batchId: number, logger: FastifyBaseLogger): Promise<void> {
  const catalog = await loadCatalog();
  const pending = await db
    .select({ id: orders.id })
    .from(orders)
    .where(and(eq(orders.batchId, batchId), eq(orders.status, 'processing')));
  const limit = pLimit(env.AI_CONCURRENCY);
  const results = await Promise.all(
    pending.map((order) => limit(() => processOrder(order.id, catalog))),
  );
  await db
    .update(batches)
    .set({ status: 'done', finishedAt: new Date() })
    .where(eq(batches.id, batchId));
  logger.info(
    { batchId, buyers: results.length, failed: results.filter((ok) => !ok).length },
    'Batch processed',
  );
}

export async function recoverInterruptedWork(): Promise<void> {
  await db
    .update(orders)
    .set({ status: 'failed', error: 'Procesamiento interrumpido por un reinicio.' })
    .where(eq(orders.status, 'processing'));
  await db
    .update(batches)
    .set({ status: 'done', finishedAt: new Date() })
    .where(eq(batches.status, 'processing'));
}
