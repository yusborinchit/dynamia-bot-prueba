const dateTimeFormat = new Intl.DateTimeFormat('es-UY', {
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

const timeFormat = new Intl.DateTimeFormat('es-UY', {
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

export function formatDateTime(value: string): string {
  return dateTimeFormat.format(new Date(value));
}

export function formatTime(value: string): string {
  return timeFormat.format(new Date(value));
}
