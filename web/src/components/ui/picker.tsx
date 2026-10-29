import * as PopoverPrimitive from '@radix-ui/react-popover';
import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';
import { ChevronsUpDown, Search, X } from 'lucide-react';
import type { KeyboardEvent, MouseEvent, ReactNode } from 'react';
import { useState } from 'react';
import { PickerList } from '#/components/ui/picker-list';
import { PickerTriggerValue } from '#/components/ui/picker-trigger-value';
import { cn } from '#/lib/cn';

export type PickerOption = {
  value: string | number;
  label: string;
  icon?: ReactNode;
};

const pickerTriggerVariants = cva(
  'flex min-h-10 w-full cursor-pointer items-center rounded-md justify-between gap-2 px-3 py-2 text-left text-sm disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:[&_[data-placeholder]]:text-transparent',
  {
    variants: {
      variant: {
        default: 'border border-input bg-card shadow-xs aria-[invalid=true]:border-destructive',
        ghost:
          'bg-transparent aria-[invalid=true]:bg-destructive/10 aria-[invalid=true]:text-destructive',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

type PickerBaseProps = VariantProps<typeof pickerTriggerVariants> & {
  options: Array<PickerOption>;
  search: string;
  onSearchChange: (search: string) => void;
  placeholder: string;
  searchPlaceholder: string;
  emptyMessage: string;
  loading?: boolean;
  withOptionIcons?: boolean;
  errorMessage?: string | null;
  disabled?: boolean;
  invalid?: boolean;
  id?: string;
  label?: string;
  className?: string;
};

type PickerSingleProps = {
  multiple?: false;
  clearable?: boolean;
  value: PickerOption | null;
  onChange: (value: PickerOption | null) => void;
};

type PickerMultipleProps = {
  multiple: true;
  value: Array<PickerOption>;
  onChange: (value: Array<PickerOption>) => void;
};

type PickerProps = PickerBaseProps & (PickerSingleProps | PickerMultipleProps);

function Picker(props: PickerProps) {
  const {
    options,
    search,
    onSearchChange,
    placeholder,
    searchPlaceholder,
    emptyMessage,
    loading = false,
    withOptionIcons = false,
    errorMessage,
    disabled,
    invalid,
    id,
    label,
    className,
    variant,
  } = props;

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const selected = props.multiple ? props.value : props.value ? [props.value] : [];
  const selectedValues = selected.map((option) => option.value);
  const active = Math.min(activeIndex, Math.max(options.length - 1, 0));
  const clearable = !props.multiple && props.clearable && props.value !== null;

  function handleSelect(option: PickerOption) {
    if (props.multiple) {
      const alreadySelected = props.value.some((item) => item.value === option.value);

      props.onChange(
        alreadySelected
          ? props.value.filter((item) => item.value !== option.value)
          : [...props.value, option],
      );
      return;
    }

    props.onChange(option);
    setOpen(false);
  }

  function handleClear(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    if (!props.multiple) props.onChange(null);
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    setActiveIndex(0);
    if (!nextOpen) onSearchChange('');
  }

  function handleSearchChange(value: string) {
    setActiveIndex(0);
    onSearchChange(value);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (options.length === 0) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((current) => Math.min(current + 1, options.length - 1));
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((current) => Math.max(current - 1, 0));
      return;
    }

    const option = options[active];
    if (event.key === 'Enter' && option) {
      event.preventDefault();
      handleSelect(option);
    }
  }

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <div className={cn('relative', className)}>
        <PopoverPrimitive.Trigger
          id={id}
          type="button"
          role="combobox"
          disabled={disabled}
          aria-label={label}
          aria-invalid={invalid}
          className={cn(pickerTriggerVariants({ variant }), clearable && 'pr-9')}
        >
          <PickerTriggerValue
            selected={selected}
            placeholder={placeholder}
            multiple={props.multiple === true}
          />

          {!clearable && <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />}
        </PopoverPrimitive.Trigger>

        {clearable && (
          <button
            type="button"
            aria-label="Quitar selección"
            className="absolute top-0 right-0 flex h-10 w-9 cursor-pointer rounded-r-md items-center justify-center text-muted-foreground hover:text-foreground"
            onClick={handleClear}
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={4}
          collisionPadding={8}
          className="z-50 w-[var(--radix-popover-trigger-width)] overflow-hidden rounded-md border bg-card shadow-lg"
        >
          <div className="relative border-border border-b">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={search}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              className="h-10 w-full bg-muted pr-3 pl-9 text-sm placeholder:text-muted-foreground focus-visible:-outline-offset-2"
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          <PickerList
            options={options}
            selectedValues={selectedValues}
            activeIndex={active}
            loading={loading}
            withOptionIcons={withOptionIcons}
            errorMessage={errorMessage}
            emptyMessage={emptyMessage}
            onSelect={handleSelect}
            onActiveIndexChange={setActiveIndex}
          />
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}

export { Picker };
