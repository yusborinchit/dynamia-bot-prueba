import { createFileRoute } from '@tanstack/react-router';
import PageHeader from '#/components/page-header';
import { QueryBoundary } from '#/components/ui/query-boundary';
import BatchesProcessButton from '#/features/batches/components/batches-process-button';
import OrdersBoard from '#/features/orders/components/orders-board';
import OrdersBoardError from '#/features/orders/components/orders-board-error';
import OrdersBoardSkeleton from '#/features/orders/components/orders-board-skeleton';
import { type OrderView, ordersSearchSchema } from '#/features/orders/lib/order-views';

export const Route = createFileRoute('/_authed/orders/')({
  validateSearch: ordersSearchSchema,
  component: OrdersPage,
});

function OrdersPage() {
  const { view } = Route.useSearch();
  const navigate = Route.useNavigate();

  function handleViewChange(next: OrderView) {
    navigate({ search: { view: next }, replace: true });
  }

  return (
    <div className="flex flex-col gap-8 p-6">
      <PageHeader
        title="Pedidos"
        description="Lo que pidió cada comprador en el grupo, para revisar y aprobar."
        actions={<BatchesProcessButton />}
      />
      <QueryBoundary fallback={<OrdersBoardSkeleton />} errorFallback={OrdersBoardError}>
        <OrdersBoard view={view} onViewChange={handleViewChange} />
      </QueryBoundary>
    </div>
  );
}
