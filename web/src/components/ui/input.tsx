import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from '#/lib/cn';

const inputVariants = cva(
  'h-10 w-full rounded-md px-3 py-2 text-sm placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:placeholder:text-transparent',
  {
    variants: {
      variant: {
        default: 'border border-input bg-card shadow-xs aria-[invalid=true]:border-destructive',
        ghost:
          'bg-transparent aria-[invalid=true]:bg-destructive/10 aria-[invalid=true]:text-destructive',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

type InputProps = ComponentProps<'input'> & VariantProps<typeof inputVariants>;

function Input({ className, variant, ...props }: InputProps) {
  return <input className={cn(inputVariants({ variant }), className)} {...props} />;
}

export { Input, inputVariants };
