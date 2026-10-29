import type { ComponentProps } from 'react';
import { cn } from '#/lib/cn';

type TableProps = ComponentProps<'table'> & {
  containerClassName?: string;
};

function Table({ className, containerClassName, ...props }: TableProps) {
  return (
    <div className={cn('overflow-x-auto rounded-lg border bg-card shadow-xs', containerClassName)}>
      <table className={cn('w-full border-collapse', className)} {...props} />
    </div>
  );
}

function TableHeader({ className, ...props }: ComponentProps<'thead'>) {
  return <thead className={cn('border-b bg-muted/60', className)} {...props} />;
}

function TableBody({ className, ...props }: ComponentProps<'tbody'>) {
  return <tbody className={cn(className)} {...props} />;
}

function TableFooter({ className, ...props }: ComponentProps<'tfoot'>) {
  return <tfoot className={cn('border-t bg-muted', className)} {...props} />;
}

function TableRow({ className, ...props }: ComponentProps<'tr'>) {
  return <tr className={cn('border-b last:border-b-0', className)} {...props} />;
}

function TableHead({ className, ...props }: ComponentProps<'th'>) {
  return (
    <th
      className={cn('px-4 py-3 text-left font-semibold text-muted-foreground text-xs', className)}
      {...props}
    />
  );
}

function TableCell({ className, ...props }: ComponentProps<'td'>) {
  return <td className={cn('px-4 py-3 text-sm', className)} {...props} />;
}

export { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow };
