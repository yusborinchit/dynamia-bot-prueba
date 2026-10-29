import { createFileRoute } from '@tanstack/react-router';
import PageHeader from '#/components/page-header';
import TableSkeleton from '#/components/table-skeleton';
import { QueryBoundary } from '#/components/ui/query-boundary';
import BuyersTable from '#/features/buyers/components/buyers-table';
import BuyersTableError from '#/features/buyers/components/buyers-table-error';

export const Route = createFileRoute('/_authed/buyers')({
  component: BuyersPage,
});

function BuyersPage() {
  return (
    <div className="flex flex-col gap-8 p-6">
      <PageHeader
        title="Compradores"
        description="Se crean solos la primera vez que alguien escribe en el grupo."
      />
      <QueryBoundary fallback={<TableSkeleton columns={5} />} errorFallback={BuyersTableError}>
        <BuyersTable />
      </QueryBoundary>
    </div>
  );
}
