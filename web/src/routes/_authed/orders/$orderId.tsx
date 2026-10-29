import { createFileRoute } from '@tanstack/react-router';
import { QueryBoundary } from '#/components/ui/query-boundary';
import OrderDetail from '#/features/orders/components/order-detail';
import OrderDetailError from '#/features/orders/components/order-detail-error';

export const Route = createFileRoute('/_authed/orders/$orderId')({
  component: OrderPage,
});

function OrderPage() {
  const { orderId } = Route.useParams();

  return (
    <div className="p-6">
      <QueryBoundary
        fallback={<div className="h-96 animate-pulse rounded-lg border bg-card" />}
        errorFallback={OrderDetailError}
      >
        <OrderDetail orderId={Number(orderId)} />
      </QueryBoundary>
    </div>
  );
}
