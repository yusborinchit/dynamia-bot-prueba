import type { OrderView } from '#/features/orders/lib/order-views';

const views: { value: OrderView; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'review', label: 'Por revisar' },
  { value: 'approved', label: 'Aprobados' },
];

type Props = {
  value: OrderView;
  counts: Record<OrderView, number>;
  onChange: (view: OrderView) => void;
};

export default function OrdersViewTabs({ value, counts, onChange }: Props) {
  return (
    <div className="flex w-fit gap-1 rounded-md bg-muted p-1">
      {views.map((view) => (
        <button
          key={view.value}
          type="button"
          aria-pressed={view.value === value}
          className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-1.5 font-medium text-muted-foreground text-sm transition-colors hover:text-foreground aria-pressed:bg-card aria-pressed:text-foreground aria-pressed:shadow-xs"
          onClick={() => onChange(view.value)}
        >
          {view.label}
          <span className="text-muted-foreground text-xs tabular-nums">{counts[view.value]}</span>
        </button>
      ))}
    </div>
  );
}
