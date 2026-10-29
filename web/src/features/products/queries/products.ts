import { queryOptions } from '@tanstack/react-query';
import { listProducts } from '#/features/products/api/products';

export const productKeys = {
  all: ['products'] as const,
  list: () => [...productKeys.all, 'list'] as const,
};

export const productsQueryOptions = queryOptions({
  queryKey: productKeys.list(),
  queryFn: listProducts,
});
