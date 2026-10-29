import type { OrderStatus, OrderSummary } from '@wsp/contracts';

export type OrderDayGroup = {
  key: string;
  label: string;
  orders: OrderSummary[];
};

const dayKeyFormat = new Intl.DateTimeFormat('en-CA', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const weekdayFormat = new Intl.DateTimeFormat('es-UY', { weekday: 'long' });

const shortDateFormat = new Intl.DateTimeFormat('es-UY', { day: '2-digit', month: '2-digit' });

const statusRank: Record<OrderStatus, number> = {
  failed: 0,
  draft: 1,
  processing: 2,
  approved: 3,
};

function dayKey(date: Date): string {
  return dayKeyFormat.format(date);
}

function dayLabel(date: Date, today: Date): string {
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const dateText = `${weekdayFormat.format(date)} ${shortDateFormat.format(date)}`;
  if (dayKey(date) === dayKey(today)) return `Hoy · ${dateText}`;
  if (dayKey(date) === dayKey(yesterday)) return `Ayer · ${dateText}`;
  return dateText;
}

function compareOrders(a: OrderSummary, b: OrderSummary): number {
  return statusRank[a.status] - statusRank[b.status] || b.created_at.localeCompare(a.created_at);
}

export function groupOrdersByDay(orders: OrderSummary[], today = new Date()): OrderDayGroup[] {
  const groups = new Map<string, OrderDayGroup>();
  for (const order of orders) {
    const createdAt = new Date(order.created_at);
    const key = dayKey(createdAt);
    const group = groups.get(key) ?? { key, label: dayLabel(createdAt, today), orders: [] };
    group.orders.push(order);
    groups.set(key, group);
  }
  return [...groups.values()]
    .sort((a, b) => b.key.localeCompare(a.key))
    .map((group) => ({ ...group, orders: group.orders.sort(compareOrders) }));
}
