import { Check, TriangleAlert } from 'lucide-react';
import type { PickerOption } from '#/components/ui/picker';
import { cn } from '#/lib/cn';

const skeletonRows = Array.from({ length: 4 }, (_, index) => index);

type Props = {
  options: Array<PickerOption>;
  selectedValues: Array<string | number>;
  activeIndex: number;
  loading: boolean;
  withOptionIcons?: boolean;
  errorMessage?: string | null;
  emptyMessage: string;
  onSelect: (option: PickerOption) => void;
  onActiveIndexChange: (index: number) => void;
};

function PickerList({
  options,
  selectedValues,
  activeIndex,
  loading,
  withOptionIcons = false,
  errorMessage,
  emptyMessage,
  onSelect,
  onActiveIndexChange,
}: Props) {
  if (errorMessage) {
    return (
      <div className="flex items-center gap-2 px-3 py-6 text-muted-foreground text-sm">
        <TriangleAlert className="size-4 shrink-0" />
        {errorMessage}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex animate-pulse flex-col p-1">
        {skeletonRows.map((row) => (
          <div key={row} className="flex items-center gap-2 px-2 py-2">
            {withOptionIcons && <div className="size-6 shrink-0 rounded-full bg-muted" />}
            <div className="h-5 w-40 rounded-md bg-muted" />
          </div>
        ))}
      </div>
    );
  }

  if (options.length === 0) {
    return <p className="px-3 py-6 text-center text-muted-foreground text-sm">{emptyMessage}</p>;
  }

  return (
    <div role="listbox" className="max-h-64 overflow-y-auto p-1">
      {options.map((option, index) => (
        <button
          key={option.value}
          type="button"
          role="option"
          aria-selected={selectedValues.includes(option.value)}
          data-active={index === activeIndex}
          data-selected={selectedValues.includes(option.value)}
          className={cn(
            'flex w-full cursor-pointer items-center justify-between gap-2 rounded-md px-2 py-2 text-left text-muted-foreground text-sm',
            'data-[selected=true]:font-medium data-[selected=true]:text-foreground',
            'data-[active=true]:bg-accent data-[active=true]:text-accent-foreground',
          )}
          onMouseEnter={() => onActiveIndexChange(index)}
          onClick={() => onSelect(option)}
        >
          <span className="flex min-w-0 items-center gap-2">
            {option.icon}
            <span className="truncate">{option.label}</span>
          </span>
          {selectedValues.includes(option.value) && <Check className="size-4 shrink-0" />}
        </button>
      ))}
    </div>
  );
}

export { PickerList };
