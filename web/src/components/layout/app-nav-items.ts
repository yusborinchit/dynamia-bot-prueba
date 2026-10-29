import type { LinkProps } from '@tanstack/react-router';
import { ClipboardList, type LucideIcon, Package, Users } from 'lucide-react';

export type AppNavItem = {
  to: LinkProps['to'];
  label: string;
  icon: LucideIcon;
  exact?: boolean;
};

export const appNavItems: AppNavItem[] = [
  { to: '/orders', label: 'Pedidos', icon: ClipboardList },
  { to: '/products', label: 'Productos', icon: Package },
  { to: '/buyers', label: 'Compradores', icon: Users },
];
