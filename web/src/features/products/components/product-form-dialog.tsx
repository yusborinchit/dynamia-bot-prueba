import { useForm } from '@tanstack/react-form';
import type { Product } from '@wsp/contracts';
import { type FormEvent, type ReactNode, useState } from 'react';
import { z } from 'zod';
import FieldError from '#/components/form/field-error';
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
import { Textarea } from '#/components/ui/textarea';
import { useSaveProductMutation } from '#/features/products/mutations/use-save-product-mutation';
import { fieldInvalid } from '#/lib/form/field-invalid';

const productFormSchema = z.object({
  name: z.string().trim().min(1).max(120),
  aliases: z.string(),
});

function parseAliases(value: string): string[] {
  return value
    .split(/[,\n]/)
    .map((alias) => alias.trim())
    .filter(Boolean);
}

type Props = {
  product?: Product;
  trigger: ReactNode;
};

export default function ProductFormDialog({ product, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const mutation = useSaveProductMutation();

  const form = useForm({
    defaultValues: { name: product?.name ?? '', aliases: product?.aliases.join(', ') ?? '' },
    validators: { onChange: productFormSchema },
    onSubmit: async ({ value }) => {
      const saved = await mutation
        .mutateAsync({
          id: product?.id ?? null,
          body: { name: value.name.trim(), aliases: parseAliases(value.aliases) },
        })
        .catch(() => null);
      if (saved) {
        setOpen(false);
      }
    },
  });

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      form.reset();
      mutation.reset();
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    event.stopPropagation();
    form.handleSubmit();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <div className="flex flex-col gap-2">
          <DialogTitle>{product ? 'Editar producto' : 'Nuevo producto'}</DialogTitle>
          <DialogDescription>
            Los alias son otras formas en que los compradores nombran el producto.
          </DialogDescription>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <form.Field name="name">
            {(field) => (
              <div className="flex flex-col gap-2">
                <Label htmlFor="product-name">Nombre</Label>
                <Input
                  id="product-name"
                  value={field.state.value}
                  aria-invalid={fieldInvalid(field.state.meta)}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                />
                <FieldError meta={field.state.meta} />
              </div>
            )}
          </form.Field>

          <form.Field name="aliases">
            {(field) => (
              <div className="flex flex-col gap-2">
                <Label htmlFor="product-aliases">Alias</Label>
                <Textarea
                  id="product-aliases"
                  rows={3}
                  placeholder="perita, tomate pera"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                />
                <p className="text-muted-foreground text-xs">Separados por coma.</p>
              </div>
            )}
          </form.Field>

          {mutation.isError && (
            <p className="text-destructive text-sm" role="alert">
              {mutation.error.message}
            </p>
          )}

          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Guardando…' : 'Guardar'}
              </Button>
            )}
          </form.Subscribe>
        </form>
      </DialogContent>
    </Dialog>
  );
}
