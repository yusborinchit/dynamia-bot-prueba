import { Leaf } from 'lucide-react';
import { cn } from '#/lib/cn';

type Props = {
  className?: string;
};

export default function AppLogo({ className }: Props) {
  return (
    <span className={cn('flex min-w-0 items-center gap-2', className)}>
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <Leaf className="size-4" />
      </span>
      <span className="truncate font-bold text-base tracking-tight">Pedidos</span>
    </span>
  );
}
