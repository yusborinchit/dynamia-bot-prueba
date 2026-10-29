import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '#/components/ui/toast';
import { updateBuyer } from '#/features/buyers/api/buyers';
import { buyerKeys } from '#/features/buyers/queries/buyers';

export function useUpdateBuyerMutation() {
  const queryClient = useQueryClient();

  async function handleSuccess() {
    await queryClient.invalidateQueries({ queryKey: buyerKeys.all });
    await queryClient.invalidateQueries({ queryKey: ['orders'] });
    toast.success('Comprador guardado.');
  }

  return useMutation({ mutationFn: updateBuyer, onSuccess: handleSuccess });
}
