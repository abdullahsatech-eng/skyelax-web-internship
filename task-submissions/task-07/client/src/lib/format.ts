/** Adds thousands separators to a decimal string without converting it to a float. */
export function formatAmount(price: string): string {
  const [whole, fraction] = price.split('.');
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return fraction === undefined ? grouped : `${grouped}.${fraction}`;
}
