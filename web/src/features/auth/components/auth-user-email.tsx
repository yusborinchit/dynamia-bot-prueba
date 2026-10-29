import { useSuspenseQuery } from '@tanstack/react-query';
import { meQueryOptions } from '#/lib/queries/me';

export default function AuthUserEmail() {
  const { data: user } = useSuspenseQuery(meQueryOptions);

  return <span className="block truncate text-muted-foreground text-xs">{user.email}</span>;
}
