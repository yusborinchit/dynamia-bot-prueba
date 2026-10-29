import type { ComponentProps } from 'react';
import { cn } from '#/lib/cn';

type TextareaProps = ComponentProps<'textarea'>;

function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        'w-full rounded-md border border-input bg-card shadow-xs px-3 py-2 text-sm placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:placeholder:text-transparent aria-[invalid=true]:border-destructive',
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
