import { useQuery } from '@tanstack/react-query';
import { Play } from 'lucide-react';
import { Button } from '#/components/ui/button';
import { Tooltip } from '#/components/ui/tooltip';
import { useCreateBatchMutation } from '#/features/batches/mutations/use-create-batch-mutation';
import { batchesQueryOptions, pendingQueryOptions } from '#/features/batches/queries/batches';

function pendingDescription(messages: number, buyers: number): string {
  if (messages === 0) return 'No hay mensajes sin procesar.';
  const messageLabel = messages === 1 ? 'mensaje' : 'mensajes';
  const buyerLabel = buyers === 1 ? 'comprador' : 'compradores';
  return `${messages} ${messageLabel} de ${buyers} ${buyerLabel} sin procesar.`;
}

export default function BatchesProcessButton() {
  const pending = useQuery(pendingQueryOptions);
  const batches = useQuery(batchesQueryOptions);
  const mutation = useCreateBatchMutation();
  const processing = batches.data?.some((batch) => batch.status === 'processing') ?? false;
  const messages = pending.data?.pending_messages ?? 0;
  const buyers = pending.data?.pending_buyers ?? 0;

  function handleProcess() {
    mutation.mutate();
  }

  return (
    <Tooltip content={pendingDescription(messages, buyers)} side="bottom">
      <span className="inline-flex">
        <Button
          type="button"
          disabled={messages === 0 || processing || mutation.isPending}
          onClick={handleProcess}
        >
          <Play className="size-4" />
          {processing ? 'Procesando…' : 'Procesar pendientes'}
          {!processing && messages > 0 && (
            <span className="rounded-full bg-primary-foreground/20 px-2 text-xs tabular-nums">
              {messages}
            </span>
          )}
        </Button>
      </span>
    </Tooltip>
  );
}
