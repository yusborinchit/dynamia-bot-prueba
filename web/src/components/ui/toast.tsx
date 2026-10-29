import { Toaster as Sonner, toast } from 'sonner';

const classNames = {
  toast:
    'flex w-full items-start gap-2 rounded-md border bg-card px-4 py-3 shadow-lg font-sans text-foreground text-sm',
  title: 'font-medium',
  closeButton:
    '-translate-y-1/2 absolute top-1/2 right-3 flex size-5 items-center justify-center border-0! bg-transparent! text-muted-foreground! hover:text-foreground!',
  description: 'text-muted-foreground text-sm',
  icon: 'flex shrink-0 items-center pt-0.5 [&>svg]:size-4',
  actionButton: 'rounded-md bg-primary px-3 py-1 text-primary-foreground text-sm',
  cancelButton: 'rounded-md border border-border bg-card px-3 py-1 text-sm',
  error: 'border-destructive text-destructive',
};

function Toaster() {
  return (
    <Sonner
      theme="light"
      position="bottom-right"
      closeButton
      toastOptions={{ unstyled: true, classNames }}
    />
  );
}

export { Toaster, toast };
