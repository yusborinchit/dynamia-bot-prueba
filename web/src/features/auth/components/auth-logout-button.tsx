import { LogOut } from 'lucide-react';
import { Button } from '#/components/ui/button';
import { Tooltip } from '#/components/ui/tooltip';
import { useLogoutMutation } from '#/features/auth/mutations/use-logout-mutation';

type Props = {
  compact?: boolean;
};

export default function AuthLogoutButton({ compact = false }: Props) {
  const mutation = useLogoutMutation();

  function handleLogout() {
    mutation.mutate();
  }

  if (compact) {
    return (
      <Tooltip content="Cerrar sesión" side="right">
        <Button
          variant="outline"
          size="icon"
          aria-label="Cerrar sesión"
          disabled={mutation.isPending}
          onClick={handleLogout}
        >
          <LogOut className="size-4" />
        </Button>
      </Tooltip>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="w-full justify-start"
      disabled={mutation.isPending}
      onClick={handleLogout}
    >
      <LogOut className="size-4" />
      Cerrar sesión
    </Button>
  );
}
