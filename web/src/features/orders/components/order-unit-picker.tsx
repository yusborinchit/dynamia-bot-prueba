import { type Unit, unitSchema } from '@wsp/contracts';
import { Picker, type PickerOption } from '#/components/ui/picker';
import { unitOptions } from '#/lib/unit-labels';
import { useLocalPicker } from '#/lib/use-local-picker';

const options: PickerOption[] = unitOptions.map(([unit, label]) => ({ value: unit, label }));

type Props = {
  value: Unit;
  disabled?: boolean;
  onChange: (unit: Unit) => void;
};

export default function OrderUnitPicker({ value, disabled, onChange }: Props) {
  const picker = useLocalPicker(options);
  const selected = options.find((option) => option.value === value) ?? null;

  function handleChange(option: PickerOption | null) {
    const parsed = unitSchema.safeParse(option?.value);
    if (parsed.success) {
      onChange(parsed.data);
    }
  }

  return (
    <Picker
      label="Unidad"
      value={selected}
      disabled={disabled}
      options={picker.options}
      search={picker.search}
      placeholder="Unidad"
      searchPlaceholder="Buscar unidad…"
      emptyMessage="No hay unidades que coincidan."
      onSearchChange={picker.onSearchChange}
      onChange={handleChange}
    />
  );
}
