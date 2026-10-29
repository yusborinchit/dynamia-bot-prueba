import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '#/components/ui/toast';
import { createBatch } from '#/features/batches/api/batches';
import { batchKeys } from '#/features/batches/queries/batches';
import { orderKeys } from '#/features/orders/queries/orders';

export function useCreateBatchMutation() {
  const queryClient = useQueryClient();

  async function handleSuccess() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: batchKeys.all }),
      queryClient.invalidateQueries({ queryKey: orderKeys.all }),
    ]);
    toast.success('Procesamiento iniciado.');
  }

  function handleError(error: Error) {
    toast.error(error.message);
  }

  return useMutation({ mutationFn: createBatch, onSuccess: handleSuccess, onError: handleError });
}
