import { describe, expect, it } from 'vitest';
import { centsToPrice, priceToCents } from '../src/utils/money';

describe('money helpers (integer cents, no floating point)', () => {
  it.each([
    ['0', 0],
    ['12', 1200],
    ['12.5', 1250],
    ['12.50', 1250],
    ['0.07', 7],
    ['19.99', 1999],
    ['9999999.99', 999_999_999],
  ])('priceToCents(%s) = %i', (price, cents) => {
    expect(priceToCents(price)).toBe(cents);
  });

  it.each([
    [0, '0.00'],
    [7, '0.07'],
    [1250, '12.50'],
    [1999, '19.99'],
    [999_999_999, '9999999.99'],
  ])('centsToPrice(%i) = %s', (cents, price) => {
    expect(centsToPrice(cents)).toBe(price);
  });

  it('round-trips values that would be inexact as floats', () => {
    expect(centsToPrice(priceToCents('0.30'))).toBe('0.30');
    expect(centsToPrice(priceToCents('1.15'))).toBe('1.15');
  });
});
