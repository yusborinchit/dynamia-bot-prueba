import type {
  OrderDetail,
  OrderItem,
  OrderItemsBody,
  OrderListQuery,
  OrderSummary,
  User,
} from '@wsp/contracts';
import { and, asc, desc, eq, isNull, type SQL } from 'drizzle-orm';
import type { FastifyBaseLogger } from 'fastify';
import { db } from '#/db/client';
import { messages, orderItems, orders } from '#/db/schema';
import { toIso, toIsoOrNull } from '#/lib/dates';
import { conflict, notFound } from '#/lib/http-error';
import { loadCatalog, processOrder } from '#/modules/batches/processing';
import { buyerName } from '#/modules/buyers/service';
import { learnAlias } from '#/modules/products/service';

const orderWith = {
  buyer: true,
  items: { with: { product: { columns: { name: true } } }, orderBy: asc(orderItems.id) },
} as const;

type OrderRow = NonNullable<
  Awaited<ReturnType<typeof db.query.orders.findFirst<{ with: typeof orderWith }>>>
>;

function toItem(item: OrderRow['items'][number]): OrderItem {
  return {
    id: item.id,
    product_id: item.productId,
    product_name: item.product?.name ?? null,
    raw_text: item.rawText,
    quantity: item.quantity,
    unit: item.unit,
    confidence: item.confidence,
  };
}

function toSummary(row: OrderRow): OrderSummary {
  return {
    id: row.id,
    buyer: { id: row.buyer.id, name: buyerName(row.buyer) },
    status: row.status,
    has_unprocessed_media: row.hasUnprocessedMedia,
    item_count: row.items.length,
    unknown_count: row.items.filter((item) => item.productId === null).length,
    error: row.error,
    items: row.items.map(toItem),
    created_at: toIso(row.createdAt),
    approved_at: toIsoOrNull(row.approvedAt),
  };
}

export async function listOrders(query: OrderListQuery): Promise<OrderSummary[]> {
  const filters: SQL[] = [];
  if (query.status) {
    filters.push(eq(orders.status, query.status));
  }
  const rows = await db.query.orders.findMany({
    with: orderWith,
    where: and(...filters),
    orderBy: desc(orders.id),
    limit: 300,
  });
  return rows.map(toSummary);
}

export async function getOrder(id: number): Promise<OrderDetail> {
  const row = await db.query.orders.findFirst({ with: orderWith, where: eq(orders.id, id) });
  if (!row) {
    throw notFound('Pedido no encontrado.');
  }
  const sourceMessages = await db
    .select()
    .from(messages)
    .where(
      and(
        eq(messages.batchId, row.batchId),
        eq(messages.buyerId, row.buyerId),
        isNull(messages.deletedAt),
      ),
    )
    .orderBy(asc(messages.sentAt));

  return {
    ...toSummary(row),
    messages: sourceMessages.map((message) => ({
      id: message.id,
      kind: message.kind,
      body: message.body,
      quoted_body: message.quotedBody,
      sent_at: toIso(message.sentAt),
    })),
  };
}

async function requireStatus(id: number, allowed: OrderSummary['status'][]): Promise<void> {
  const [order] = await db.select({ status: orders.status }).from(orders).where(eq(orders.id, id));
  if (!order) {
    throw notFound('Pedido no encontrado.');
  }
  if (!allowed.includes(order.status)) {
    throw conflict('El pedido no se puede modificar en su estado actual.');
  }
}

export async function updateOrderItems(id: number, body: OrderItemsBody): Promise<OrderDetail> {
  await requireStatus(id, ['draft', 'failed']);
  await db.transaction(async (tx) => {
    await tx.delete(orderItems).where(eq(orderItems.orderId, id));
    if (body.items.length > 0) {
      await tx.insert(orderItems).values(
        body.items.map((item) => ({
          orderId: id,
          productId: item.product_id,
          rawText: item.raw_text,
          quantity: item.quantity,
          unit: item.unit,
          confidence: null,
        })),
      );
    }
    for (const item of body.items) {
      if (item.product_id !== null) {
        await learnAlias(tx, item.product_id, item.raw_text);
      }
    }
    await tx.update(orders).set({ status: 'draft', error: null }).where(eq(orders.id, id));
  });
  return getOrder(id);
}

export async function approveOrder(id: number, user: User): Promise<OrderDetail> {
  await requireStatus(id, ['draft']);
  await db
    .update(orders)
    .set({ status: 'approved', approvedAt: new Date(), approvedBy: user.id })
    .where(eq(orders.id, id));
  return getOrder(id);
}

export async function retryOrder(id: number, logger: FastifyBaseLogger): Promise<OrderDetail> {
  await requireStatus(id, ['failed']);
  await db.update(orders).set({ status: 'processing', error: null }).where(eq(orders.id, id));
  loadCatalog()
    .then((catalog) => processOrder(id, catalog))
    .catch((error: unknown) => {
      logger.error({ err: error, orderId: id }, 'Order retry failed');
    });
  return getOrder(id);
}
