import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import AppError from '#/components/app-error';
import AppShell from '#/components/layout/app-shell';
import { clearToken, getToken } from '#/lib/api/auth-token';
import { isUnauthorized } from '#/lib/api/is-unauthorized';
import { meQueryOptions } from '#/lib/queries/me';

export const Route = createFileRoute('/_authed')({
  beforeLoad: async ({ context, location }) => {
    if (!getToken()) {
      throw redirect({ to: '/login', search: { redirect: location.href } });
    }
    try {
      const user = await context.queryClient.ensureQueryData(meQueryOptions);
      return { user };
    } catch (error) {
      if (!isUnauthorized(error)) {
        throw error;
      }
      clearToken();
      throw redirect({ to: '/login', search: { redirect: location.href } });
    }
  },
  errorComponent: AppError,
  component: AuthedLayout,
});

function AuthedLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
