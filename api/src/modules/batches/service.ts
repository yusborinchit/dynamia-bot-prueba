import type { Batch, PendingResponse } from '@wsp/contracts';
import { and, count, countDistinct, desc, eq, inArray, isNull, sql } from 'drizzle-orm';
import type { FastifyBaseLogger } from 'fastify';
import { db } from '#/db/client';
import { batches, messages, orders } from '#/db/schema';
import { toIso, toIsoOrNull } from '#/lib/dates';
import { notFound, unprocessable } from '#/lib/http-error';
import { runBatch } from './processing';

const pendingMessages = and(isNull(messages.batchId), isNull(messages.deletedAt));

export async function listBatches(): Promise<Batch[]> {
  const rows = await db.select().from(batches).orderBy(desc(batches.id)).limit(50);
  const ids = rows.map((row) => row.id);
  if (ids.length === 0) {
    return [];
  }
  const messageCounts = await db
    .select({ batchId: messages.batchId, total: count() })
    .from(messages)
    .where(inArray(messages.batchId, ids))
    .groupBy(messages.batchId);
  const orderCounts = await db
    .select({
      batchId: orders.batchId,
      total: count(),
      failed: count(sql`case when ${orders.status} = 'failed' then 1 end`),
    })
    .from(orders)
    .where(inArray(orders.batchId, ids))
    .groupBy(orders.batchId);

  return rows.map((row) => {
    const orderCount = orderCounts.find((item) => item.batchId === row.id);
    return {
      id: row.id,
      status: row.status,
      message_count: messageCounts.find((item) => item.batchId === row.id)?.total ?? 0,
      order_count: orderCount?.total ?? 0,
      failed_count: orderCount?.failed ?? 0,
      created_at: toIso(row.createdAt),
      finished_at: toIsoOrNull(row.finishedAt),
    };
  });
}

async function findBatch(id: number): Promise<Batch> {
  const batch = (await listBatches()).find((item) => item.id === id);
  if (!batch) {
    throw notFound('Lote no encontrado.');
  }
  return batch;
}

export async function pendingSummary(): Promise<PendingResponse> {
  const [row] = await db
    .select({
      messages: sql<number>`count(*)::int`,
      buyers: countDistinct(messages.buyerId),
    })
    .from(messages)
    .where(pendingMessages);
  return { pending_messages: row?.messages ?? 0, pending_buyers: row?.buyers ?? 0 };
}

export async function createBatch(logger: FastifyBaseLogger): Promise<Batch> {
  const batchId = await db.transaction(async (tx) => {
    const running = await tx
      .select({ id: batches.id })
      .from(batches)
      .where(eq(batches.status, 'processing'))
      .limit(1);
    if (running.length > 0) {
      throw unprocessable('Ya hay un procesamiento en curso.');
    }
    const [batch] = await tx.insert(batches).values({}).returning({ id: batches.id });
    if (!batch) {
      throw new Error('Batch insert returned no row');
    }
    const assigned = await tx
      .update(messages)
      .set({ batchId: batch.id })
      .where(pendingMessages)
      .returning({ buyerId: messages.buyerId });
    if (assigned.length === 0) {
      throw unprocessable('No hay mensajes pendientes para procesar.');
    }
    const buyerIds = [...new Set(assigned.map((row) => row.buyerId))];
    await tx.insert(orders).values(buyerIds.map((buyerId) => ({ batchId: batch.id, buyerId })));
    return batch.id;
  });

  runBatch(batchId, logger).catch((error: unknown) => {
    logger.error({ err: error, batchId }, 'Batch processing failed');
  });

  return findBatch(batchId);
}
