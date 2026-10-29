import { queryOptions } from '@tanstack/react-query';
import { getPending, listBatches } from '#/features/batches/api/batches';

export const batchKeys = {
  all: ['batches'] as const,
  list: () => [...batchKeys.all, 'list'] as const,
  pending: () => [...batchKeys.all, 'pending'] as const,
};

export const batchesQueryOptions = queryOptions({
  queryKey: batchKeys.list(),
  queryFn: listBatches,
  refetchInterval: (query) =>
    query.state.data?.some((batch) => batch.status === 'processing') ? 2_000 : false,
});

export const pendingQueryOptions = queryOptions({
  queryKey: batchKeys.pending(),
  queryFn: getPending,
  refetchInterval: 15_000,
});
