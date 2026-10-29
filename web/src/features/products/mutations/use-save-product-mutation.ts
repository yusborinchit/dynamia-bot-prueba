import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ProductBody } from '@wsp/contracts';
import { toast } from '#/components/ui/toast';
import { createProduct, updateProduct } from '#/features/products/api/products';
import { productKeys } from '#/features/products/queries/products';

type Variables = { id: number | null; body: ProductBody };

function saveProduct({ id, body }: Variables) {
  return id === null ? createProduct(body) : updateProduct({ id, body });
}

export function useSaveProductMutation() {
  const queryClient = useQueryClient();

  async function handleSuccess(_data: unknown, variables: Variables) {
    await queryClient.invalidateQueries({ queryKey: productKeys.all });
    toast.success(variables.id === null ? 'Producto creado.' : 'Producto guardado.');
  }

  return useMutation({ mutationFn: saveProduct, onSuccess: handleSuccess });
}
