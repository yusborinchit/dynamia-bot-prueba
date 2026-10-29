import type { AnyFieldMeta } from '@tanstack/react-form';
import { fieldErrorText } from '#/lib/form/field-error-text';
import { fieldInvalid } from '#/lib/form/field-invalid';

type Props = {
  meta: AnyFieldMeta;
};

export default function FieldError({ meta }: Props) {
  if (!fieldInvalid(meta)) return null;

  return <p className="text-destructive text-sm">{fieldErrorText(meta.errors)}</p>;
}
