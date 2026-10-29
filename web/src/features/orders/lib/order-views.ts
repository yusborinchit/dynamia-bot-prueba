import type { OrderStatus, OrderSummary } from '@wsp/contracts';
import { z } from 'zod';

export const orderViewSchema = z.enum(['all', 'review', 'approved']);

export type OrderView = z.infer<typeof orderViewSchema>;

export const ordersSearchSchema = z.object({
  view: orderViewSchema.default('all'),
});

const viewStatuses: Record<OrderView, OrderStatus[]> = {
  all: ['processing', 'draft', 'failed', 'approved'],
  review: ['draft', 'failed'],
  approved: ['approved'],
};

export function ordersInView(orders: OrderSummary[], view: OrderView): OrderSummary[] {
  return orders.filter((order) => viewStatuses[view].includes(order.status));
}
