import type { OrderItem } from '@wsp/contracts';
import { Fragment } from 'react';
import { unitLabels } from '#/lib/unit-labels';

const quantityFormat = new Intl.NumberFormat('es-UY', { maximumFractionDigits: 2 });

type Props = {
  items: OrderItem[];
};

export default function OrderItemsSummary({ items }: Props) {
  if (items.length === 0) {
    return <p className="text-muted-foreground text-sm">Sin productos.</p>;
  }

  return (
    <p className="line-clamp-2 text-sm">
      {items.map((item, index) => (
        <Fragment key={item.id}>
          {index > 0 && <span className="text-muted-foreground"> · </span>}
          <span className="tabular-nums">{quantityFormat.format(item.quantity)}</span>{' '}
          <span className="text-muted-foreground">{unitLabels[item.unit].toLowerCase()}</span>{' '}
          {item.product_name ? (
            item.product_name.toLowerCase()
          ) : (
            <span className="text-destructive">"{item.raw_text}"</span>
          )}
        </Fragment>
      ))}
    </p>
  );
}
