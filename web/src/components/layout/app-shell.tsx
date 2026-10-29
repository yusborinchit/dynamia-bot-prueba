import { Link } from '@tanstack/react-router';
import { Menu } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import AppLogo from '#/components/app-logo';
import AppSidebar from '#/components/layout/app-sidebar';
import { Sheet, SheetContent, SheetTrigger } from '#/components/ui/sheet';
import { cn } from '#/lib/cn';
import { readSidebarCollapsed, writeSidebarCollapsed } from '#/lib/sidebar-collapsed';

type Props = {
  children: ReactNode;
};

export default function AppShell({ children }: Props) {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(readSidebarCollapsed);

  function handleToggleCollapsed() {
    const next = !collapsed;
    setCollapsed(next);
    writeSidebarCollapsed(next);
  }

  return (
    <div className="flex min-h-svh">
      <aside
        className={cn(
          'sticky top-0 hidden h-svh shrink-0 border-r bg-card md:flex md:flex-col',
          collapsed ? 'w-14' : 'w-60',
        )}
      >
        <AppSidebar collapsed={collapsed} onToggleCollapsed={handleToggleCollapsed} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-2 border-b bg-card px-4 py-4 md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              aria-label="Abrir menú"
              className="flex size-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent title="Navegación" hideTitle>
              <AppSidebar onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
          <Link to="/orders" className="flex min-w-0 flex-1 items-center">
            <AppLogo />
          </Link>
        </header>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
