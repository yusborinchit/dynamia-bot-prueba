import { queryOptions } from '@tanstack/react-query';
import { getWhatsappStatus } from '#/features/whatsapp/api/get-whatsapp-status';

export const whatsappStatusQueryOptions = queryOptions({
  queryKey: ['whatsapp', 'status'],
  queryFn: getWhatsappStatus,
  refetchInterval: 10_000,
});
