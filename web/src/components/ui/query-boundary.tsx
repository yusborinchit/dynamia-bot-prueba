import { QueryErrorResetBoundary } from '@tanstack/react-query';
import type { ComponentType, ReactNode } from 'react';
import { Suspense } from 'react';
import type { FallbackProps } from 'react-error-boundary';
import { ErrorBoundary } from 'react-error-boundary';

type Props = {
  fallback: ReactNode;
  errorFallback: ComponentType<FallbackProps>;
  children: ReactNode;
};

export function QueryBoundary({ fallback, errorFallback, children }: Props) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary onReset={reset} FallbackComponent={errorFallback}>
          <Suspense fallback={fallback}>{children}</Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
