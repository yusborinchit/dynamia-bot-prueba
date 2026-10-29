import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';
import { HTTPError } from 'ky';
import { TriangleAlert } from 'lucide-react';
import { Button } from '#/components/ui/button';
import { cn } from '#/lib/cn';

const errorStateVariants = cva('flex flex-col items-center gap-4 text-center', {
  variants: {
    variant: {
      panel: 'rounded-lg border bg-card px-6 py-12 shadow-xs',
      card: 'rounded-lg border bg-card px-4 py-12 shadow-xs',
      field: 'rounded-md bg-muted px-6 py-8',
      column: 'px-4 py-12',
    },
  },
  defaultVariants: { variant: 'panel' },
});

const iconSizes = {
  panel: 'size-6',
  card: 'size-6',
  field: 'size-5',
  column: 'size-5',
} as const;

type Variant = NonNullable<VariantProps<typeof errorStateVariants>['variant']>;

type Props = {
  message: string;
  onRetry: () => void;
  error?: unknown;
  forbidden?: string;
  notFound?: string;
  invalid?: string;
  variant?: Variant;
  className?: string;
};

function statusMessage(error: unknown, { message, forbidden, notFound, invalid }: Props): string {
  if (error === undefined) return message;
  if (!(error instanceof HTTPError)) return 'No pudimos conectarnos con el servidor.';
  if (forbidden && error.response.status === 403) return forbidden;
  if (notFound && error.response.status === 404) return notFound;
  if (invalid && error.response.status === 422) return invalid;

  return message;
}

export default function QueryErrorState(props: Props) {
  const { onRetry, error, variant = 'panel', className } = props;
  const Container = variant === 'card' ? 'section' : 'div';

  return (
    <Container className={cn(errorStateVariants({ variant }), className)}>
      <TriangleAlert className={cn(iconSizes[variant], 'text-muted-foreground')} />
      <p className="text-sm">{statusMessage(error, props)}</p>
      <Button
        type="button"
        variant="outline"
        size={variant === 'column' ? 'sm' : 'default'}
        onClick={onRetry}
      >
        Reintentar
      </Button>
    </Container>
  );
}
