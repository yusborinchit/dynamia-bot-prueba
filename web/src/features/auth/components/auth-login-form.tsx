import { useForm } from '@tanstack/react-form';
import { loginBodySchema } from '@wsp/contracts';
import type { FormEvent } from 'react';
import FieldError from '#/components/form/field-error';
import { Button } from '#/components/ui/button';
import { Input } from '#/components/ui/input';
import { Label } from '#/components/ui/label';
import { useLoginMutation } from '#/features/auth/mutations/use-login-mutation';
import { fieldInvalid } from '#/lib/form/field-invalid';

type Props = {
  onLoggedIn: () => void;
};

export default function AuthLoginForm({ onLoggedIn }: Props) {
  const mutation = useLoginMutation();

  const form = useForm({
    defaultValues: { email: '', password: '' },
    validators: { onChange: loginBodySchema },
    onSubmit: async ({ value }) => {
      const result = await mutation.mutateAsync(value).catch(() => null);
      if (result) {
        onLoggedIn();
      }
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    event.stopPropagation();
    form.handleSubmit();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <form.Field name="email">
        {(field) => (
          <div className="flex flex-col gap-2">
            <Label htmlFor={field.name}>Email</Label>
            <Input
              id={field.name}
              type="email"
              autoComplete="email"
              value={field.state.value}
              aria-invalid={fieldInvalid(field.state.meta)}
              onBlur={field.handleBlur}
              onChange={(event) => field.handleChange(event.target.value)}
            />
            <FieldError meta={field.state.meta} />
          </div>
        )}
      </form.Field>

      <form.Field name="password">
        {(field) => (
          <div className="flex flex-col gap-2">
            <Label htmlFor={field.name}>Contraseña</Label>
            <Input
              id={field.name}
              type="password"
              autoComplete="current-password"
              value={field.state.value}
              aria-invalid={fieldInvalid(field.state.meta)}
              onBlur={field.handleBlur}
              onChange={(event) => field.handleChange(event.target.value)}
            />
            <FieldError meta={field.state.meta} />
          </div>
        )}
      </form.Field>

      {mutation.isError && (
        <p className="text-destructive text-sm" role="alert">
          {mutation.error.message}
        </p>
      )}

      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(isSubmitting) => (
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Ingresando…' : 'Ingresar'}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
