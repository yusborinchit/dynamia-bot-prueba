import type { AnyFieldMeta } from '@tanstack/react-form';

export function fieldInvalid(meta: AnyFieldMeta): boolean {
  return meta.isTouched && meta.errors.length > 0;
}
