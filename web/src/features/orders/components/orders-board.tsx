import { useSuspenseQuery } from '@tanstack/react-query';
import OrderCard from '#/features/orders/components/order-card';
import OrdersViewTabs from '#/features/orders/components/orders-view-tabs';
import { groupOrdersByDay } from '#/features/orders/lib/group-orders-by-day';
import { type OrderView, ordersInView } from '#/features/orders/lib/order-views';
import { ordersQueryOptions } from '#/features/orders/queries/orders';

const emptyMessages: Record<OrderView, string> = {
  all: 'Todavía no hay pedidos. Aparecen acá después de procesar los mensajes del grupo.',
  review: 'No hay pedidos por revisar.',
  approved: 'Todavía no hay pedidos aprobados.',
};

type Props = {
  view: OrderView;
  onViewChange: (view: OrderView) => void;
};

export default function OrdersBoard({ view, onViewChange }: Props) {
  const { data } = useSuspenseQuery(ordersQueryOptions({}));
  const counts: Record<OrderView, number> = {
    all: data.length,
    review: ordersInView(data, 'review').length,
    approved: ordersInView(data, 'approved').length,
  };
  const groups = groupOrdersByDay(ordersInView(data, view));

  return (
    <div className="flex flex-col gap-8">
      <OrdersViewTabs value={view} counts={counts} onChange={onViewChange} />

      {groups.length === 0 && (
        <p className="rounded-lg border border-dashed px-6 py-12 text-center text-muted-foreground text-sm">
          {emptyMessages[view]}
        </p>
      )}

      {groups.map((group) => (
        <section key={group.key} className="flex flex-col gap-4">
          <h2 className="font-semibold text-muted-foreground text-sm first-letter:uppercase">
            {group.label}
          </h2>
          <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {group.orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
