import {
  type OrderDetail,
  type OrderItemsBody,
  type OrderListQuery,
  type OrderSummary,
  orderDetailSchema,
  orderListResponseSchema,
} from '@wsp/contracts';
import { apiError } from '#/lib/api/api-error';
import { api } from '#/lib/api/client';

export async function listOrders(query: OrderListQuery): Promise<OrderSummary[]> {
  const searchParams: Record<string, string | number> = {};
  if (query.status) {
    searchParams.status = query.status;
  }
  return orderListResponseSchema.parse(await api.get('orders', { searchParams }).json()).data;
}

export async function getOrder(id: number): Promise<OrderDetail> {
  return orderDetailSchema.parse(await api.get(`orders/${id}`).json());
}

export async function updateOrderItems({
  id,
  body,
}: {
  id: number;
  body: OrderItemsBody;
}): Promise<OrderDetail> {
  try {
    return orderDetailSchema.parse(await api.put(`orders/${id}/items`, { json: body }).json());
  } catch (error) {
    throw apiError(error, 'No pudimos guardar el pedido.');
  }
}

export async function approveOrder(id: number): Promise<OrderDetail> {
  try {
    return orderDetailSchema.parse(await api.post(`orders/${id}/approve`).json());
  } catch (error) {
    throw apiError(error, 'No pudimos aprobar el pedido.');
  }
}

export async function retryOrder(id: number): Promise<OrderDetail> {
  try {
    return orderDetailSchema.parse(await api.post(`orders/${id}/retry`).json());
  } catch (error) {
    throw apiError(error, 'No pudimos reintentar el pedido.');
  }
}
