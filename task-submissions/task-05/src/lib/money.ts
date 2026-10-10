import type { CurrencyCode } from '../types';

/** Money is added in integer cents so that 0.1 + 0.2 style rounding errors can never reach the UI. */
export const toCents = (amount: number): number => Math.round(amount * 100);
export const fromCents = (cents: number): number => cents / 100;

const MONEY_PATTERN = /^(\d{1,3}(,\d{3})+|\d+)(\.\d{1,2})?$/;

/**
 * Parses text typed into a money field. Accepts digits with optional thousands commas and up to
 * two decimals ("8500", "8,500.50"). Anything else (negatives, "1e5", symbols, "abc") returns null.
 */
export function parseMoney(text: string): number | null {
  const trimmed = text.trim();
  if (!MONEY_PATTERN.test(trimmed)) return null;
  const value = Number(trimmed.replace(/,/g, ''));
  return Number.isFinite(value) ? value : null;
}

/** Parses a whole number of days ("5"). Returns null for anything that is not a non-negative integer. */
export function parseWholeNumber(text: string): number | null {
  const trimmed = text.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  const value = Number(trimmed);
  return Number.isSafeInteger(value) ? value : null;
}

const formatterCache = new Map<string, Intl.NumberFormat>();

function getFormatter(currency: CurrencyCode, fractionDigits: number): Intl.NumberFormat {
  const key = `${currency}:${fractionDigits}`;
  let formatter = formatterCache.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: 2,
    });
    formatterCache.set(key, formatter);
  }
  return formatter;
}

export function formatMoney(amount: number, currency: CurrencyCode): string {
  if (!Number.isFinite(amount)) return '—';
  return getFormatter(currency, Number.isInteger(amount) ? 0 : 2).format(amount);
}

/** "+$1,200" for positive values, "$0" for zero. Used where a value is an addition. */
export function formatAddedMoney(amount: number, currency: CurrencyCode): string {
  if (!Number.isFinite(amount)) return '—';
  return amount > 0 ? `+${formatMoney(amount, currency)}` : formatMoney(0, currency);
}

export function formatDays(days: number): string {
  if (!Number.isFinite(days)) return '—';
  if (days <= 0) return 'No delay';
  return `+${days} ${days === 1 ? 'day' : 'days'}`;
}
