/**
 * Prices are stored as integer minor units ("cents") so no floating-point arithmetic
 * is ever applied to money. The API exposes prices as strings such as "12.50".
 */
export const MAX_PRICE_CENTS = 999_999_999; // 9,999,999.99

/** Converts a validated price string ("12", "12.5", "12.50") to integer cents. */
export function priceToCents(price: string): number {
  const [whole, fraction = ''] = price.split('.');
  return Number(whole) * 100 + Number(`${fraction}00`.slice(0, 2));
}

/** Converts integer cents to a price string with exactly two decimals. */
export function centsToPrice(cents: number): string {
  const whole = Math.floor(cents / 100);
  const fraction = String(cents % 100).padStart(2, '0');
  return `${whole}.${fraction}`;
}
