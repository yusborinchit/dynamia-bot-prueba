import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { OrderDetail } from '@wsp/contracts';
import { toast } from '#/components/ui/toast';
import { approveOrder, retryOrder, updateOrderItems } from '#/features/orders/api/orders';
import { orderKeys } from '#/features/orders/queries/orders';
import { productKeys } from '#/features/products/queries/products';

function useOrderCacheUpdate() {
  const queryClient = useQueryClient();

  return async function update(order: OrderDetail) {
    queryClient.setQueryData(orderKeys.detail(order.id), order);
    await queryClient.invalidateQueries({ queryKey: [...orderKeys.all, 'list'] });
  };
}

export function useSaveOrderItemsMutation() {
  const queryClient = useQueryClient();
  const update = useOrderCacheUpdate();

  async function handleSuccess(order: OrderDetail) {
    await update(order);
    await queryClient.invalidateQueries({ queryKey: productKeys.all });
  }

  return useMutation({ mutationFn: updateOrderItems, onSuccess: handleSuccess });
}

export function useApproveOrderMutation() {
  const update = useOrderCacheUpdate();

  async function handleSuccess(order: OrderDetail) {
    await update(order);
    toast.success(`Pedido de ${order.buyer.name} aprobado.`);
  }

  return useMutation({ mutationFn: approveOrder, onSuccess: handleSuccess });
}

export function useRetryOrderMutation() {
  const update = useOrderCacheUpdate();

  function handleError(error: Error) {
    toast.error(error.message);
  }

  return useMutation({ mutationFn: retryOrder, onSuccess: update, onError: handleError });
}
