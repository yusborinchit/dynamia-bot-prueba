import { createFileRoute, redirect } from '@tanstack/react-router';
import { z } from 'zod';
import CenteredPage from '#/components/centered-page';
import AuthLoginForm from '#/features/auth/components/auth-login-form';
import { getToken } from '#/lib/api/auth-token';

const searchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute('/login')({
  validateSearch: searchSchema,
  beforeLoad: () => {
    if (getToken()) {
      throw redirect({ to: '/orders' });
    }
  },
  component: LoginPage,
});

function LoginPage() {
  const { redirect: target } = Route.useSearch();
  const navigate = Route.useNavigate();

  function handleLoggedIn() {
    if (target?.startsWith('/')) {
      navigate({ href: target, replace: true });
      return;
    }
    navigate({ to: '/orders', replace: true });
  }

  return (
    <CenteredPage>
      <div className="flex w-full max-w-sm flex-col gap-8 rounded-xl border bg-card p-8 shadow-lg">
        <div className="flex flex-col gap-2">
          <h1 className="font-semibold text-2xl">Iniciar sesión</h1>
          <p className="text-muted-foreground text-sm">Panel de pedidos del grupo de WhatsApp.</p>
        </div>
        <AuthLoginForm onLoggedIn={handleLoggedIn} />
      </div>
    </CenteredPage>
  );
}
