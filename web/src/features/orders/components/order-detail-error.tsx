import type { FallbackProps } from 'react-error-boundary';
import QueryErrorState from '#/components/query-error-state';

export default function OrderDetailError({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <QueryErrorState
      error={error}
      message="No pudimos cargar el pedido."
      notFound="El pedido no existe."
      onRetry={resetErrorBoundary}
    />
  );
}
