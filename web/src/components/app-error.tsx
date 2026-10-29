import { useRouter } from '@tanstack/react-router';
import CenteredPage from '#/components/centered-page';
import { Button } from '#/components/ui/button';

export default function AppError() {
  const router = useRouter();

  function handleRetry() {
    router.invalidate();
  }

  return (
    <CenteredPage>
      <div className="flex w-full max-w-sm flex-col gap-6 rounded-xl border bg-card p-8 shadow-lg">
        <div className="flex flex-col gap-2">
          <h1 className="font-semibold text-xl">Algo salió mal</h1>
          <p className="text-muted-foreground text-sm">
            No pudimos cargar la página. Volvé a intentar en un momento.
          </p>
        </div>
        <Button type="button" onClick={handleRetry}>
          Reintentar
        </Button>
      </div>
    </CenteredPage>
  );
}
