import type { ComponentProps } from 'react';
import { cn } from '#/lib/cn';

type LabelProps = ComponentProps<'label'>;

function Label({ className, ...props }: LabelProps) {
  return <label className={cn('font-medium text-sm', className)} {...props} />;
}

export { Label };
