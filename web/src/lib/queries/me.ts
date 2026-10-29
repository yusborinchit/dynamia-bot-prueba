import { queryOptions } from '@tanstack/react-query';
import { me } from '#/lib/api/me';

export const meQueryOptions = queryOptions({
  queryKey: ['auth', 'me'],
  queryFn: me,
});
