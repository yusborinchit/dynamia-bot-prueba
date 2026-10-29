import { Link } from '@tanstack/react-router';
import type { OrderSummary } from '@wsp/contracts';
import { CircleAlert, HelpCircle, Paperclip } from 'lucide-react';
import OrderItemsSummary from '#/features/orders/components/order-items-summary';
import OrderStatusBadge from '#/features/orders/components/order-status-badge';
import { formatTime } from '#/lib/format-date-time';

type Props = {
  order: OrderSummary;
};

export default function OrderCard({ order }: Props) {
  return (
    <Link
      to="/orders/$orderId"
      params={{ orderId: String(order.id) }}
      data-status={order.status}
      className="flex flex-col gap-2 rounded-lg border bg-card p-4 shadow-xs transition-colors hover:border-border-strong hover:bg-muted/40 data-[status=approved]:bg-card/60"
    >
      <div className="flex items-start justify-between gap-4">
        <span className="font-semibold">{order.buyer.name}</span>
        <OrderStatusBadge status={order.status} />
      </div>

      {order.status === 'failed' ? (
        <p className="text-muted-foreground text-sm">
          No se pudo armar el pedido. Abrilo para reintentar.
        </p>
      ) : (
        <OrderItemsSummary items={order.items} />
      )}

      <div className="flex items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap gap-4">
          {order.unknown_count > 0 && (
            <span className="inline-flex items-center gap-1 text-destructive">
              <HelpCircle className="size-3.5" />
              {order.unknown_count} sin reconocer
            </span>
          )}
          {order.has_unprocessed_media && (
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <Paperclip className="size-3.5" />
              Mandó audio o foto
            </span>
          )}
          {order.status === 'failed' && (
            <span className="inline-flex items-center gap-1 text-destructive">
              <CircleAlert className="size-3.5" />
              Error de la IA
            </span>
          )}
        </div>
        <span className="text-muted-foreground tabular-nums">{formatTime(order.created_at)}</span>
      </div>
    </Link>
  );
}
