import { Link } from '@tanstack/react-router';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import AppLogo from '#/components/app-logo';
import { appNavItems } from '#/components/layout/app-nav-items';
import AppSidebarNavItem from '#/components/layout/app-sidebar-nav-item';
import { Button } from '#/components/ui/button';
import { QueryBoundary } from '#/components/ui/query-boundary';
import { Tooltip } from '#/components/ui/tooltip';
import AuthLogoutButton from '#/features/auth/components/auth-logout-button';
import AuthUserEmail from '#/features/auth/components/auth-user-email';
import WhatsappStatusIndicator from '#/features/whatsapp/components/whatsapp-status-indicator';
import { cn } from '#/lib/cn';

type Props = {
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
  onNavigate?: () => void;
};

export default function AppSidebar({ collapsed = false, onToggleCollapsed, onNavigate }: Props) {
  const toggleLabel = collapsed ? 'Expandir menú' : 'Colapsar menú';

  return (
    <div className="flex h-full flex-col">
      <div
        className={cn(
          'flex h-14 shrink-0 items-center border-b',
          collapsed ? 'justify-center' : 'justify-between gap-2 pr-2 pl-4',
        )}
      >
        {!collapsed && (
          <Link to="/orders" onClick={onNavigate} className="flex min-w-0 items-center">
            <AppLogo />
          </Link>
        )}

        {onToggleCollapsed && (
          <Tooltip content={toggleLabel} side="right">
            <Button
              variant="ghost"
              size="icon"
              aria-label={toggleLabel}
              aria-expanded={!collapsed}
              onClick={onToggleCollapsed}
            >
              {collapsed ? (
                <PanelLeftOpen className="size-5" />
              ) : (
                <PanelLeftClose className="size-5" />
              )}
            </Button>
          </Tooltip>
        )}
      </div>

      <nav className="flex flex-1 flex-col overflow-y-auto p-2">
        {appNavItems.map((item) => (
          <AppSidebarNavItem
            key={item.to}
            item={item}
            collapsed={collapsed}
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      {collapsed ? (
        <div className="flex flex-col items-center gap-2 border-t p-2">
          <WhatsappStatusIndicator compact />
          <AuthLogoutButton compact />
        </div>
      ) : (
        <div className="flex flex-col gap-4 border-t p-4">
          <WhatsappStatusIndicator />
          <QueryBoundary
            fallback={<div className="h-4 w-32 rounded-md bg-muted" />}
            errorFallback={() => null}
          >
            <AuthUserEmail />
          </QueryBoundary>
          <AuthLogoutButton />
        </div>
      )}
    </div>
  );
}
