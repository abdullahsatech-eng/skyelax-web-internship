/**
 * Calendar-date helpers. Dates are plain `YYYY-MM-DD` strings and all arithmetic is done in UTC,
 * so results never shift with the viewer's time zone or daylight-saving changes.
 */
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isIsoDate(value: string): boolean {
  const match = ISO_DATE.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

/** Adds whole days to an ISO date. Returns null when the date or day count is invalid. */
export function addDaysIso(isoDate: string, days: number): string | null {
  if (!isIsoDate(isoDate) || !Number.isInteger(days)) return null;
  const [year, month, day] = isoDate.split('-').map(Number);
  const result = new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
  return isIsoDate(result) ? result : null;
}

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

/** Formats an ISO date or timestamp as "12 Dec 2026". Returns an em dash when unreadable. */
export function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  const day = value.slice(0, 10);
  if (!isIsoDate(day)) return '—';
  return dateFormatter.format(new Date(`${day}T00:00:00Z`));
}
