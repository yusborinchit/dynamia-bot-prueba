import { Search } from 'lucide-react';
import type { ComponentProps } from 'react';
import { cn } from '#/lib/cn';

type SearchInputProps = Omit<ComponentProps<'input'>, 'type' | 'onChange'> & {
  onValueChange: (value: string) => void;
};

function SearchInput({ className, onValueChange, ...props }: SearchInputProps) {
  return (
    <div className={cn('relative', className)}>
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="search"
        className="h-10 w-full rounded-md border border-input bg-card shadow-xs py-2 pr-3 pl-9 text-sm placeholder:text-muted-foreground"
        onChange={(event) => onValueChange(event.target.value)}
        {...props}
      />
    </div>
  );
}

export { SearchInput };
