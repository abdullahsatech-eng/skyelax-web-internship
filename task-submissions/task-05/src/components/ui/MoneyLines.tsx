import { formatMoney } from '../../lib/money';
import type { CurrencyCode } from '../../types';

/** One formatted amount per currency (amounts in different currencies are never added together). */
export function MoneyLines({ items, emptyText = 'None' }: { items: { currency: CurrencyCode; amount: number }[]; emptyText?: string }) {
  if (items.length === 0) return <span className="money-lines money-lines--empty">{emptyText}</span>;
  return (
    <ul className="money-lines">
      {items.map((item) => (
        <li key={item.currency}>{formatMoney(item.amount, item.currency)}</li>
      ))}
    </ul>
  );
}
