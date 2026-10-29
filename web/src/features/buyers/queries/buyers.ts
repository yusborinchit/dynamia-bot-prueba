import { queryOptions } from '@tanstack/react-query';
import { listBuyers } from '#/features/buyers/api/buyers';

export const buyerKeys = {
  all: ['buyers'] as const,
  list: () => [...buyerKeys.all, 'list'] as const,
};

export const buyersQueryOptions = queryOptions({
  queryKey: buyerKeys.list(),
  queryFn: listBuyers,
});
