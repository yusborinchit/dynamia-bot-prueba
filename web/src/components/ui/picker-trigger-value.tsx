import type { PickerOption } from '#/components/ui/picker';

type Props = {
  selected: Array<PickerOption>;
  placeholder: string;
  multiple: boolean;
};

function PickerTriggerValue({ selected, placeholder, multiple }: Props) {
  const [first] = selected;

  if (!first)
    return (
      <span data-placeholder="true" className="text-muted-foreground">
        {placeholder}
      </span>
    );

  if (!multiple)
    return (
      <span className="flex min-w-0 items-center gap-2">
        {first.icon}
        <span className="truncate">{first.label}</span>
      </span>
    );

  return (
    <span className="flex flex-wrap items-center gap-2">
      {selected.map((option) => (
        <span
          key={option.value}
          className="flex items-center gap-2 rounded-full bg-accent px-2 py-0.5 text-accent-foreground text-xs leading-5"
        >
          {option.icon}
          {option.label}
        </span>
      ))}
    </span>
  );
}

export { PickerTriggerValue };
