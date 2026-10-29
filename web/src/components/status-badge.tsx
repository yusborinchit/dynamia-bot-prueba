import type { LucideIcon } from 'lucide-react';
import { cn } from '#/lib/cn';

type StatusTone = 'neutral' | 'progress' | 'done' | 'danger';

const tones: Record<StatusTone, string> = {
  neutral: 'bg-status-neutral text-status-neutral-foreground',
  progress: 'bg-status-progress text-status-progress-foreground',
  done: 'bg-status-done text-status-done-foreground',
  danger: 'bg-destructive/10 text-destructive',
};

type Props = {
  label: string;
  icon: LucideIcon;
  tone: StatusTone;
};

export default function StatusBadge({ label, icon: Icon, tone }: Props) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-full py-1 pr-2.5 pl-2 font-medium text-xs',
        tones[tone],
      )}
    >
      <Icon className="size-3.5" />
      {label}
    </span>
  );
}

export type { StatusTone };
