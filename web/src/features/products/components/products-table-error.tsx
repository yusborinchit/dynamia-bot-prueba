import type { FallbackProps } from 'react-error-boundary';
import QueryErrorState from '#/components/query-error-state';

export default function ProductsTableError({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <QueryErrorState
      error={error}
      message="No pudimos cargar los productos."
      onRetry={resetErrorBoundary}
    />
  );
}
