import { keepPreviousData, queryOptions } from '@tanstack/react-query';
import type { OrderListQuery } from '@wsp/contracts';
import { getOrder, listOrders } from '#/features/orders/api/orders';

export const orderKeys = {
  all: ['orders'] as const,
  list: (query: OrderListQuery) => [...orderKeys.all, 'list', query] as const,
  detail: (id: number) => [...orderKeys.all, 'detail', id] as const,
};

export function ordersQueryOptions(query: OrderListQuery) {
  return queryOptions({
    queryKey: orderKeys.list(query),
    queryFn: () => listOrders(query),
    placeholderData: keepPreviousData,
    refetchInterval: (current) =>
      current.state.data?.some((order) => order.status === 'processing') ? 2_000 : false,
  });
}

export function orderQueryOptions(id: number) {
  return queryOptions({
    queryKey: orderKeys.detail(id),
    queryFn: () => getOrder(id),
    refetchInterval: (current) => (current.state.data?.status === 'processing' ? 2_000 : false),
  });
}
