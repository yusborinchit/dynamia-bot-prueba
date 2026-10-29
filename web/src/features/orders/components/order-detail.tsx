import { useSuspenseQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import OrderItemsForm from '#/features/orders/components/order-items-form';
import OrderMessages from '#/features/orders/components/order-messages';
import OrderStatusBadge from '#/features/orders/components/order-status-badge';
import { orderQueryOptions } from '#/features/orders/queries/orders';
import { formatDateTime } from '#/lib/format-date-time';

type Props = {
  orderId: number;
};

export default function OrderDetail({ orderId }: Props) {
  const { data: order } = useSuspenseQuery(orderQueryOptions(orderId));

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <Link
          to="/orders"
          className="inline-flex items-center gap-2 self-start text-muted-foreground text-sm hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Pedidos
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="font-semibold text-xl">{order.buyer.name}</h1>
            <p className="text-muted-foreground text-sm">
              {formatDateTime(order.created_at)}
              {order.approved_at && ` · aprobado ${formatDateTime(order.approved_at)}`}
            </p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-[2fr_3fr]">
        <OrderMessages messages={order.messages} />
        <OrderItemsForm
          key={`${order.id}-${order.status}-${order.items.map((item) => item.id).join('.')}`}
          order={order}
        />
      </div>
    </div>
  );
}
