import { useSuspenseQuery } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table';
import BuyerRenameDialog from '#/features/buyers/components/buyer-rename-dialog';
import { buyersQueryOptions } from '#/features/buyers/queries/buyers';
import { formatDateTime } from '#/lib/format-date-time';

export default function BuyersTable() {
  const { data } = useSuspenseQuery(buyersQueryOptions);

  if (data.length === 0) {
    return (
      <div className="rounded-lg border bg-card px-6 py-12 text-center text-muted-foreground text-sm">
        Todavía no escribió nadie en el grupo.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Nombre en WhatsApp</TableHead>
          <TableHead>Teléfono</TableHead>
          <TableHead>Primer mensaje</TableHead>
          <TableHead className="w-12" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((buyer) => (
          <TableRow key={buyer.id}>
            <TableCell className="font-medium">{buyer.name}</TableCell>
            <TableCell className="text-muted-foreground">{buyer.wa_name ?? '—'}</TableCell>
            <TableCell className="text-muted-foreground tabular-nums">
              {buyer.phone ?? '—'}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {formatDateTime(buyer.created_at)}
            </TableCell>
            <TableCell>
              <BuyerRenameDialog buyer={buyer} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
