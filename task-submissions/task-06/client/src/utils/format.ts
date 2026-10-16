const dateFormatter = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' });
const dateTimeFormatter = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' });

export function formatDate(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? '-' : dateFormatter.format(date);
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? '-' : dateTimeFormatter.format(date);
}
