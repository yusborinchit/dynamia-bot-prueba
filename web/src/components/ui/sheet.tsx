import * as DialogPrimitive from '@radix-ui/react-dialog';
import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';
import { X } from 'lucide-react';
import type { ComponentProps } from 'react';
import { cn } from '#/lib/cn';

const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;
const SheetClose = DialogPrimitive.Close;

const sheetVariants = cva(
  '@container fixed inset-y-0 z-50 flex max-w-[85vw] flex-col bg-background',
  {
    variants: {
      side: {
        left: 'left-0 rounded-r-lg border-r shadow-xl',
        right: 'right-0 rounded-l-lg border-l shadow-xl',
      },
      size: {
        sm: 'w-72',
        lg: 'w-[32rem]',
      },
    },
    defaultVariants: { side: 'left', size: 'sm' },
  },
);

type SheetContentProps = ComponentProps<typeof DialogPrimitive.Content> &
  VariantProps<typeof sheetVariants> & {
    title: string;
    hideTitle?: boolean;
  };

function SheetContent({
  className,
  side,
  size,
  title,
  hideTitle,
  children,
  ...props
}: SheetContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm" />
      <DialogPrimitive.Content className={cn(sheetVariants({ side, size }), className)} {...props}>
        <DialogPrimitive.Title
          className={cn(hideTitle ? 'sr-only' : 'border-b px-6 py-4 font-semibold text-lg')}
        >
          {title}
        </DialogPrimitive.Title>
        <DialogPrimitive.Close
          aria-label="Cerrar"
          className="absolute top-4 right-4 flex size-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <X className="size-4" />
        </DialogPrimitive.Close>
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export { Sheet, SheetClose, SheetContent, SheetTrigger };
