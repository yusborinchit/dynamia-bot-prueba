import type { Confidence } from '@wsp/contracts';
import { cn } from '#/lib/cn';

const confidences: Record<Confidence, { label: string; className: string }> = {
  high: { label: 'Alta', className: 'text-status-done-foreground' },
  medium: { label: 'Media', className: 'text-status-progress-foreground' },
  low: { label: 'Baja', className: 'text-destructive' },
};

type Props = {
  confidence: Confidence | null;
};

export default function OrderConfidence({ confidence }: Props) {
  if (!confidence) {
    return <span className="text-muted-foreground text-xs">Editado</span>;
  }
  const { label, className } = confidences[confidence];
  return <span className={cn('font-medium text-xs', className)}>{label}</span>;
}
