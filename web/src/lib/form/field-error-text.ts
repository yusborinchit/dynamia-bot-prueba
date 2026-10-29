export function fieldErrorText(errors: Array<unknown>): string | null {
  const first = errors[0];

  if (!first) return null;
  if (typeof first === 'string') return first;
  if (typeof first === 'object' && 'message' in first) return String(first.message);

  return null;
}
