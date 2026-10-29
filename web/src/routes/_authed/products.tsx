import { createFileRoute } from '@tanstack/react-router';
import { Plus } from 'lucide-react';
import { z } from 'zod';
import PageHeader from '#/components/page-header';
import TableSkeleton from '#/components/table-skeleton';
import { Button } from '#/components/ui/button';
import { QueryBoundary } from '#/components/ui/query-boundary';
import { SearchInput } from '#/components/ui/search-input';
import ProductFormDialog from '#/features/products/components/product-form-dialog';
import ProductsTable from '#/features/products/components/products-table';
import ProductsTableError from '#/features/products/components/products-table-error';

const searchSchema = z.object({
  search: z.string().optional(),
});

export const Route = createFileRoute('/_authed/products')({
  validateSearch: searchSchema,
  component: ProductsPage,
});

function ProductsPage() {
  const { search = '' } = Route.useSearch();
  const navigate = Route.useNavigate();

  function handleSearchChange(value: string) {
    navigate({ search: { search: value || undefined }, replace: true });
  }

  return (
    <div className="flex flex-col gap-8 p-6">
      <PageHeader
        title="Productos"
        description="Catálogo contra el que la IA reconoce los pedidos."
        actions={
          <ProductFormDialog
            trigger={
              <Button type="button">
                <Plus className="size-4" />
                Nuevo producto
              </Button>
            }
          />
        }
      />

      <div className="flex flex-col gap-4">
        <SearchInput
          className="max-w-sm"
          placeholder="Buscar por nombre o alias"
          value={search}
          onValueChange={handleSearchChange}
        />
        <QueryBoundary fallback={<TableSkeleton columns={3} />} errorFallback={ProductsTableError}>
          <ProductsTable search={search} />
        </QueryBoundary>
      </div>
    </div>
  );
}
