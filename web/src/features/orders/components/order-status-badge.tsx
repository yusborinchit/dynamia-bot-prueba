import type { OrderStatus } from '@wsp/contracts';
import { CircleAlert, CircleCheck, FilePen, Loader } from 'lucide-react';
import StatusBadge from '#/components/status-badge';

const statuses = {
  processing: { label: 'Procesando', icon: Loader, tone: 'progress' },
  draft: { label: 'Por revisar', icon: FilePen, tone: 'neutral' },
  failed: { label: 'Con error', icon: CircleAlert, tone: 'danger' },
  approved: { label: 'Aprobado', icon: CircleCheck, tone: 'done' },
} as const;

type Props = {
  status: OrderStatus;
};

export default function OrderStatusBadge({ status }: Props) {
  const { label, icon, tone } = statuses[status];
  return <StatusBadge label={label} icon={icon} tone={tone} />;
}
