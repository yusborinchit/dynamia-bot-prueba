import { useQuery } from '@tanstack/react-query';
import { Picker, type PickerOption } from '#/components/ui/picker';
import { productsQueryOptions } from '#/features/products/queries/products';
import { useLocalPicker } from '#/lib/use-local-picker';

type Props = {
  value: number | null;
  disabled?: boolean;
  onChange: (productId: number | null) => void;
};

export default function OrderProductPicker({ value, disabled, onChange }: Props) {
  const { data, isPending, isError } = useQuery(productsQueryOptions);
  const options = data?.map((product) => ({ value: product.id, label: product.name })) ?? [];
  const picker = useLocalPicker(options);
  const selected = options.find((option) => option.value === value) ?? null;

  function handleChange(option: PickerOption | null) {
    onChange(option ? Number(option.value) : null);
  }

  return (
    <Picker
      clearable
      label="Producto"
      value={selected}
      invalid={value === null}
      disabled={disabled}
      options={picker.options}
      search={picker.search}
      loading={isPending}
      errorMessage={isError ? 'No pudimos cargar los productos.' : null}
      placeholder="No reconocido"
      searchPlaceholder="Buscar producto…"
      emptyMessage="No hay productos que coincidan."
      onSearchChange={picker.onSearchChange}
      onChange={handleChange}
    />
  );
}
