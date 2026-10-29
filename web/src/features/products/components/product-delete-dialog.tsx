import type { Product } from '@wsp/contracts';
import { Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '#/components/ui/alert-dialog';
import { Button } from '#/components/ui/button';
import { useDeleteProductMutation } from '#/features/products/mutations/use-delete-product-mutation';

type Props = {
  product: Product;
};

export default function ProductDeleteDialog({ product }: Props) {
  const mutation = useDeleteProductMutation();

  function handleConfirm() {
    mutation.mutate(product.id);
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={`Borrar ${product.name}`}>
          <Trash2 className="size-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <div className="flex flex-col gap-2">
          <AlertDialogTitle>Borrar producto</AlertDialogTitle>
          <AlertDialogDescription>
            Se borra "{product.name}" con sus alias. Los pedidos que lo usaban quedan con ese ítem
            como no reconocido.
          </AlertDialogDescription>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>Borrar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
