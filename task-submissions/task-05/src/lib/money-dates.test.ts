import { describe, expect, it } from 'vitest';
import { addDaysIso, formatDate, isIsoDate } from './dates';
import { formatAddedMoney, formatDays, formatMoney, parseMoney, parseWholeNumber } from './money';

describe('parseMoney', () => {
  it('accepts plain numbers, thousands commas and up to two decimals', () => {
    expect(parseMoney('1500')).toBe(1500);
    expect(parseMoney(' 1,500.50 ')).toBe(1500.5);
    expect(parseMoney('0')).toBe(0);
    expect(parseMoney('0.99')).toBe(0.99);
  });

  it('rejects negatives, symbols, words, scientific notation and bad grouping', () => {
    for (const bad of ['-5', '$100', 'abc', '1e5', '1,50', '12.345', '', '  ', '1..2', 'NaN', 'Infinity']) {
      expect(parseMoney(bad)).toBeNull();
    }
  });
});

describe('parseWholeNumber', () => {
  it('accepts non-negative integers only', () => {
    expect(parseWholeNumber('7')).toBe(7);
    expect(parseWholeNumber('007')).toBe(7);
    for (const bad of ['-1', '1.5', 'x', '', '1e3', '99999999999999999999']) {
      expect(parseWholeNumber(bad)).toBeNull();
    }
  });
});

describe('formatting', () => {
  it('formats money without clutter for whole amounts', () => {
    expect(formatMoney(8500, 'USD')).toBe('$8,500');
    expect(formatMoney(1500.5, 'USD')).toBe('$1,500.50');
    expect(formatMoney(Number.NaN, 'USD')).toBe('—');
  });

  it('formats additions and days', () => {
    expect(formatAddedMoney(1200, 'USD')).toBe('+$1,200');
    expect(formatAddedMoney(0, 'USD')).toBe('$0');
    expect(formatDays(0)).toBe('No delay');
    expect(formatDays(1)).toBe('+1 day');
    expect(formatDays(6)).toBe('+6 days');
  });
});

describe('dates', () => {
  it('validates real calendar dates only', () => {
    expect(isIsoDate('2026-02-28')).toBe(true);
    expect(isIsoDate('2026-02-30')).toBe(false);
    expect(isIsoDate('2026-13-01')).toBe(false);
    expect(isIsoDate('26-01-01')).toBe(false);
    expect(isIsoDate('')).toBe(false);
  });

  it('adds days across boundaries and rejects invalid input', () => {
    expect(addDaysIso('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDaysIso('2026-03-01', 0)).toBe('2026-03-01');
    expect(addDaysIso('2026-03-01', 1.5)).toBeNull();
    expect(addDaysIso('bad', 1)).toBeNull();
  });

  it('formats dates in a time-zone independent way', () => {
    expect(formatDate('2026-12-05')).toBe('5 Dec 2026');
    expect(formatDate('2026-12-05T23:59:00.000Z')).toBe('5 Dec 2026');
    expect(formatDate('garbage')).toBe('—');
    expect(formatDate(undefined)).toBe('—');
  });
});
