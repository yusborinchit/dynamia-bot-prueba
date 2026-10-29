import { useQuery } from '@tanstack/react-query';
import type { WhatsappStatus } from '@wsp/contracts';
import type { StatusTone } from '#/components/status-badge';
import { Tooltip } from '#/components/ui/tooltip';
import { whatsappStatusQueryOptions } from '#/features/whatsapp/queries/whatsapp-status';
import { cn } from '#/lib/cn';

type Display = { label: string; description: string; tone: StatusTone };

function display(status: WhatsappStatus | undefined, failed: boolean): Display {
  if (failed || !status) {
    return {
      label: 'Sin datos',
      description: 'No pudimos consultar el estado de la conexión.',
      tone: 'danger',
    };
  }
  if (status.waiting_for_qr) {
    return {
      label: 'Esperando QR',
      description: 'Escaneá el QR que muestra el servidor desde el teléfono del bot.',
      tone: 'progress',
    };
  }
  if (status.connection === 'open' && !status.group_configured) {
    return {
      label: 'Sin grupo',
      description: 'Conectado, pero falta configurar el grupo a escuchar.',
      tone: 'progress',
    };
  }
  if (status.connection === 'open') {
    return {
      label: 'Conectado',
      description: 'Escuchando los mensajes del grupo.',
      tone: 'done',
    };
  }
  if (status.connection === 'connecting') {
    return {
      label: 'Conectando',
      description: 'Estableciendo la conexión con WhatsApp.',
      tone: 'progress',
    };
  }
  return {
    label: 'Desconectado',
    description: 'El bot no está recibiendo mensajes.',
    tone: 'danger',
  };
}

const dotTones: Record<StatusTone, string> = {
  neutral: 'bg-muted-foreground',
  progress: 'bg-status-progress-foreground',
  done: 'bg-primary',
  danger: 'bg-destructive',
};

type Props = {
  compact?: boolean;
};

export default function WhatsappStatusIndicator({ compact = false }: Props) {
  const { data, isError } = useQuery(whatsappStatusQueryOptions);
  const current = display(data, isError);

  return (
    <Tooltip content={current.description} side="right">
      <span
        role="status"
        aria-label={`WhatsApp: ${current.label}. ${current.description}`}
        className={cn(
          'flex items-center gap-2 rounded-md text-xs',
          compact ? 'size-9 justify-center' : 'px-1 py-1',
        )}
      >
        <span className="relative flex size-2.5 shrink-0">
          {current.tone === 'done' && (
            <span className="absolute inset-0 animate-ping rounded-full bg-primary opacity-50" />
          )}
          <span className={cn('relative size-2.5 rounded-full', dotTones[current.tone])} />
        </span>
        {!compact && (
          <span className="truncate text-muted-foreground">
            WhatsApp · <span className="font-medium text-foreground">{current.label}</span>
          </span>
        )}
      </span>
    </Tooltip>
  );
}
