import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

export default function CenteredPage({ children }: Props) {
  return <div className="flex min-h-svh items-center justify-center p-6">{children}</div>;
}
