import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '#/components/ui/toast';
import { deleteProduct } from '#/features/products/api/products';
import { productKeys } from '#/features/products/queries/products';

export function useDeleteProductMutation() {
  const queryClient = useQueryClient();

  async function handleSuccess() {
    await queryClient.invalidateQueries({ queryKey: productKeys.all });
    toast.success('Producto borrado.');
  }

  function handleError(error: Error) {
    toast.error(error.message);
  }

  return useMutation({ mutationFn: deleteProduct, onSuccess: handleSuccess, onError: handleError });
}
