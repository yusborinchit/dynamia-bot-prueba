import type { Buyer } from '@wsp/contracts';
import { Pencil } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { Button } from '#/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '#/components/ui/dialog';
import { Input } from '#/components/ui/input';
import { Label } from '#/components/ui/label';
import { useUpdateBuyerMutation } from '#/features/buyers/mutations/use-update-buyer-mutation';

type Props = {
  buyer: Buyer;
};

export default function BuyerRenameDialog({ buyer }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(buyer.display_name ?? '');
  const mutation = useUpdateBuyerMutation();

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setName(buyer.display_name ?? '');
      mutation.reset();
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const saved = await mutation
      .mutateAsync({ id: buyer.id, body: { display_name: name.trim() || null } })
      .catch(() => null);
    if (saved) {
      setOpen(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={`Renombrar ${buyer.name}`}>
          <Pencil className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <div className="flex flex-col gap-2">
          <DialogTitle>Nombre del comprador</DialogTitle>
          <DialogDescription>
            En WhatsApp figura como "{buyer.wa_name ?? 'sin nombre'}". Dejalo vacío para usar ese
            nombre.
          </DialogDescription>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="buyer-name">Nombre</Label>
            <Input
              id="buyer-name"
              value={name}
              maxLength={120}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          {mutation.isError && (
            <p className="text-destructive text-sm" role="alert">
              {mutation.error.message}
            </p>
          )}
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Guardando…' : 'Guardar'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
