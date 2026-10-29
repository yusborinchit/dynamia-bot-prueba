import type { core } from 'zod';
import { config } from 'zod';
import { es } from 'zod/locales';

type Issue = core.$ZodRawIssue;

const REQUIRED = 'Este campo es obligatorio.';
const INVALID = 'El valor no es válido.';
const INVALID_FORMAT = 'El formato no es válido.';

const formatMessages: Record<string, string> = {
  email: 'Ingresá un correo válido.',
  url: 'Ingresá una URL válida.',
  date: 'Ingresá una fecha válida.',
  datetime: 'Ingresá una fecha y hora válidas.',
  time: 'Ingresá una hora válida.',
};

function isMissing(input: unknown): boolean {
  return input === undefined || input === null || input === '';
}

function tooSmall(issue: Extract<Issue, { code: 'too_small' }>): string {
  const minimum = Number(issue.minimum);

  if (issue.origin === 'string')
    return minimum <= 1 ? REQUIRED : `Tiene que tener al menos ${minimum} caracteres.`;

  if (issue.origin === 'array' || issue.origin === 'set')
    return minimum <= 1 ? 'Agregá al menos un elemento.' : `Agregá al menos ${minimum} elementos.`;

  if (issue.origin === 'file') return 'El archivo está vacío.';

  if (minimum === 0 && issue.inclusive === false) return 'Tiene que ser mayor que cero.';

  return issue.inclusive === false
    ? `Tiene que ser mayor que ${minimum}.`
    : `Tiene que ser ${minimum} o más.`;
}

function tooBig(issue: Extract<Issue, { code: 'too_big' }>): string {
  const maximum = Number(issue.maximum);

  if (issue.origin === 'string') return `No puede tener más de ${maximum} caracteres.`;

  if (issue.origin === 'array' || issue.origin === 'set')
    return `No puede tener más de ${maximum} elementos.`;

  if (issue.origin === 'file') return 'El archivo es demasiado grande.';

  return issue.inclusive === false
    ? `Tiene que ser menor que ${maximum}.`
    : `Tiene que ser ${maximum} o menos.`;
}

function appError(issue: Issue): string | undefined {
  switch (issue.code) {
    case 'invalid_type':
      return isMissing(issue.input) ? REQUIRED : INVALID;
    case 'too_small':
      return tooSmall(issue);
    case 'too_big':
      return tooBig(issue);
    case 'invalid_format':
      if (isMissing(issue.input)) return REQUIRED;

      return formatMessages[issue.format] ?? INVALID_FORMAT;
    case 'invalid_value':
      return isMissing(issue.input) ? REQUIRED : 'Elegí una opción válida.';
    case 'invalid_union':
    case 'not_multiple_of':
      return INVALID;
    default:
      return undefined;
  }
}

config({ ...es(), customError: appError });
