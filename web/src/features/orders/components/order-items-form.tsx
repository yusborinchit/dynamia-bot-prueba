import { useForm } from '@tanstack/react-form';
import { useNavigate } from '@tanstack/react-router';
import { type OrderDetail, type OrderItemsBody, orderItemsBodySchema } from '@wsp/contracts';
import { Check, Plus, RotateCcw, Save, Trash2 } from 'lucide-react';
import type { FormEvent } from 'react';
import { Button } from '#/components/ui/button';
import { Input } from '#/components/ui/input';
import { listOrders } from '#/features/orders/api/orders';
import OrderConfidence from '#/features/orders/components/order-confidence';
import OrderProductPicker from '#/features/orders/components/order-product-picker';
import OrderUnitPicker from '#/features/orders/components/order-unit-picker';
import {
  useApproveOrderMutation,
  useRetryOrderMutation,
  useSaveOrderItemsMutation,
} from '#/features/orders/mutations/use-order-mutations';
import { cn } from '#/lib/cn';

type Props = {
  order: OrderDetail;
};

function initialValues(order: OrderDetail): OrderItemsBody {
  return {
    items: order.items.map((item) => ({
      product_id: item.product_id,
      raw_text: item.raw_text,
      quantity: item.quantity,
      unit: item.unit,
    })),
  };
}

export default function OrderItemsForm({ order }: Props) {
  const navigate = useNavigate();
  const saveMutation = useSaveOrderItemsMutation();
  const approveMutation = useApproveOrderMutation();
  const retryMutation = useRetryOrderMutation();
  const readOnly = order.status === 'approved' || order.status === 'processing';

  const form = useForm({
    defaultValues: initialValues(order),
    validators: { onChange: orderItemsBodySchema },
    onSubmit: async ({ value, meta }) => {
      const saved = await saveMutation.mutateAsync({ id: order.id, body: value }).catch(() => null);
      if (!saved || meta !== 'approve') {
        return;
      }
      const approved = await approveMutation.mutateAsync(order.id).catch(() => null);
      if (approved) {
        await goToNextDraft();
      }
    },
    onSubmitMeta: 'save' as 'save' | 'approve',
  });

  async function goToNextDraft() {
    const drafts = await listOrders({ status: 'draft' });
    const next = drafts.find((draft) => draft.id !== order.id);
    if (next) {
      await navigate({ to: '/orders/$orderId', params: { orderId: String(next.id) } });
      return;
    }
    await navigate({ to: '/orders', search: { view: 'review' } });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    event.stopPropagation();
    form.handleSubmit('save');
  }

  function handleApprove() {
    form.handleSubmit('approve');
  }

  function handleRetry() {
    retryMutation.mutate(order.id);
  }

  const error = saveMutation.error ?? approveMutation.error;

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-lg border bg-card p-6 shadow-xs"
    >
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-medium text-muted-foreground text-xs uppercase tracking-widest">
          Pedido
        </h2>
        {order.status === 'failed' && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={retryMutation.isPending}
            onClick={handleRetry}
          >
            <RotateCcw className="size-4" />
            Reintentar con IA
          </Button>
        )}
      </div>

      {order.status === 'failed' && order.error && (
        <p className="bg-destructive/10 px-3 py-2 text-destructive text-sm">{order.error}</p>
      )}

      {order.status === 'processing' && (
        <p className="text-muted-foreground text-sm">La IA está armando este pedido…</p>
      )}

      {order.has_unprocessed_media && (
        <p className="rounded-md bg-status-progress px-3 py-2 text-sm text-status-progress-foreground">
          El comprador mandó audios, fotos o archivos. Revisalos en WhatsApp y agregá lo que falte a
          mano.
        </p>
      )}

      <fieldset disabled={readOnly} className="flex flex-col gap-4 border-0 p-0">
        <form.Field name="items" mode="array">
          {(itemsField) => (
            <div className="flex flex-col gap-2">
              {itemsField.state.value.length === 0 && (
                <p className="text-muted-foreground text-sm">Sin productos.</p>
              )}

              {itemsField.state.value.map((item, index) => {
                const original = order.items[index];
                const unknown = item.product_id === null;
                return (
                  <div
                    // biome-ignore lint/suspicious/noArrayIndexKey: rows are positional in the form array
                    key={index}
                    className={cn(
                      'grid grid-cols-[1fr_auto] gap-2 rounded-md border p-3 sm:grid-cols-[2fr_5rem_9rem_auto]',
                      unknown && 'border-destructive bg-destructive/5',
                    )}
                  >
                    <div className="col-span-2 flex flex-col gap-1 sm:col-span-1">
                      <form.Field name={`items[${index}].product_id`}>
                        {(field) => (
                          <OrderProductPicker
                            value={field.state.value}
                            disabled={readOnly}
                            onChange={field.handleChange}
                          />
                        )}
                      </form.Field>
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-muted-foreground text-xs">
                          Escribió: "{item.raw_text}"
                        </span>
                        {original && original.raw_text === item.raw_text && (
                          <OrderConfidence confidence={original.confidence} />
                        )}
                      </div>
                    </div>

                    <form.Field name={`items[${index}].quantity`}>
                      {(field) => (
                        <Input
                          type="number"
                          aria-label="Cantidad"
                          min={0}
                          step="0.5"
                          value={Number.isNaN(field.state.value) ? '' : field.state.value}
                          aria-invalid={field.state.meta.errors.length > 0}
                          onChange={(event) => field.handleChange(event.target.valueAsNumber)}
                        />
                      )}
                    </form.Field>

                    <form.Field name={`items[${index}].unit`}>
                      {(field) => (
                        <OrderUnitPicker
                          value={field.state.value}
                          disabled={readOnly}
                          onChange={field.handleChange}
                        />
                      )}
                    </form.Field>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Quitar producto"
                      onClick={() => itemsField.removeValue(index)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                );
              })}

              {!readOnly && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="self-start"
                  onClick={() =>
                    itemsField.pushValue({
                      product_id: null,
                      raw_text: 'agregado a mano',
                      quantity: 1,
                      unit: 'crate',
                    })
                  }
                >
                  <Plus className="size-4" />
                  Agregar producto
                </Button>
              )}
            </div>
          )}
        </form.Field>

        {error && (
          <p className="text-destructive text-sm" role="alert">
            {error.message}
          </p>
        )}

        {!readOnly && (
          <form.Subscribe
            selector={(state) => [state.isSubmitting, state.canSubmit, state.isDirty] as const}
          >
            {([isSubmitting, canSubmit, isDirty]) => (
              <div className="flex flex-wrap justify-end gap-2">
                <Button
                  type="submit"
                  variant="outline"
                  disabled={isSubmitting || !canSubmit || !isDirty}
                >
                  <Save className="size-4" />
                  Guardar
                </Button>
                <Button type="button" disabled={isSubmitting || !canSubmit} onClick={handleApprove}>
                  <Check className="size-4" />
                  {isDirty ? 'Guardar y aprobar' : 'Aprobar'}
                </Button>
              </div>
            )}
          </form.Subscribe>
        )}
      </fieldset>
    </form>
  );
}
