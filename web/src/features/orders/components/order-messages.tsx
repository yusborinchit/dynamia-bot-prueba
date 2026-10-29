import type { OrderMessage } from '@wsp/contracts';
import { Paperclip } from 'lucide-react';
import { formatTime } from '#/lib/format-date-time';

type Props = {
  messages: OrderMessage[];
};

export default function OrderMessages({ messages }: Props) {
  return (
    <section className="flex flex-col gap-4 rounded-lg border bg-card p-6 shadow-xs">
      <h2 className="font-medium text-muted-foreground text-xs uppercase tracking-widest">
        Mensajes del grupo
      </h2>
      {messages.length === 0 && (
        <p className="text-muted-foreground text-sm">No quedan mensajes para este pedido.</p>
      )}
      <ol className="flex flex-col gap-2">
        {messages.map((message) => (
          <li key={message.id} className="flex flex-col gap-1 rounded-lg bg-muted px-3 py-2">
            {message.quoted_body && (
              <p className="rounded-r-md border-primary border-l-2 bg-card/60 py-1 pl-2 text-muted-foreground text-xs">
                {message.quoted_body}
              </p>
            )}
            {message.kind === 'media' && (
              <span className="inline-flex items-center gap-1 text-muted-foreground text-xs">
                <Paperclip className="size-4" />
                Audio, foto o archivo (no se procesa)
              </span>
            )}
            {message.body && <p className="whitespace-pre-wrap text-sm">{message.body}</p>}
            <span className="self-end text-muted-foreground text-xs tabular-nums">
              {formatTime(message.sent_at)}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
