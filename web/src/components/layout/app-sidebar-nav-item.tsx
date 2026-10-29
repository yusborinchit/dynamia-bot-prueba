import { Link } from '@tanstack/react-router';
import type { AppNavItem } from '#/components/layout/app-nav-items';
import { Tooltip } from '#/components/ui/tooltip';

type Props = {
  item: AppNavItem;
  collapsed?: boolean;
  onNavigate?: () => void;
};

export default function AppSidebarNavItem({ item, collapsed = false, onNavigate }: Props) {
  const Icon = item.icon;

  const link = (
    <Link
      to={item.to}
      activeOptions={{ exact: item.exact }}
      onClick={onNavigate}
      className="flex items-center gap-2 rounded-md px-3 py-2 text-muted-foreground text-sm transition-colors hover:bg-muted hover:text-foreground data-[status=active]:bg-accent data-[status=active]:font-semibold data-[status=active]:text-accent-foreground"
    >
      <Icon className="size-4 shrink-0" />
      <span className={collapsed ? 'sr-only' : undefined}>{item.label}</span>
    </Link>
  );

  if (!collapsed) return link;

  return (
    <Tooltip content={item.label} side="right">
      {link}
    </Tooltip>
  );
}
