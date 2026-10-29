import { useSuspenseQuery } from '@tanstack/react-query';
import { Pencil } from 'lucide-react';
import { Button } from '#/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table';
import ProductDeleteDialog from '#/features/products/components/product-delete-dialog';
import ProductFormDialog from '#/features/products/components/product-form-dialog';
import { productsQueryOptions } from '#/features/products/queries/products';

type Props = {
  search: string;
};

export default function ProductsTable({ search }: Props) {
  const { data } = useSuspenseQuery(productsQueryOptions);
  const term = search.trim().toLowerCase();
  const products = term
    ? data.filter(
        (product) =>
          product.name.toLowerCase().includes(term) ||
          product.aliases.some((alias) => alias.includes(term)),
      )
    : data;

  if (products.length === 0) {
    return (
      <div className="rounded-lg border bg-card px-6 py-12 text-center text-muted-foreground text-sm">
        {term ? 'No hay productos que coincidan con la búsqueda.' : 'Todavía no hay productos.'}
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Producto</TableHead>
          <TableHead>Alias</TableHead>
          <TableHead className="w-24" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => (
          <TableRow key={product.id}>
            <TableCell className="font-medium">{product.name}</TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-1">
                {product.aliases.map((alias) => (
                  <span
                    key={alias}
                    className="rounded-full bg-muted px-2 py-0.5 text-muted-foreground text-xs"
                  >
                    {alias}
                  </span>
                ))}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex justify-end">
                <ProductFormDialog
                  product={product}
                  trigger={
                    <Button variant="ghost" size="icon" aria-label={`Editar ${product.name}`}>
                      <Pencil className="size-4" />
                    </Button>
                  }
                />
                <ProductDeleteDialog product={product} />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
