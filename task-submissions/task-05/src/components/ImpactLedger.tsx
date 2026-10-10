import type { ImpactSummary } from '../lib/calculations';
import { formatDate } from '../lib/dates';
import { formatAddedMoney, formatDays, formatMoney } from '../lib/money';

/**
 * Shows the original agreement next to what a change would add. Solid = agreed, hatched = proposed.
 * The bar is decorative (aria-hidden); the same numbers are listed as text below it.
 */
export function ImpactLedger({ summary }: { summary: ImpactSummary }) {
  const { currency } = summary;
  const barSegments = [
    { key: 'original', kind: 'original', amount: summary.originalBudget },
    ...summary.additions.map((addition, index) => ({ key: `add-${index}`, kind: addition.kind, amount: addition.cost })),
  ].filter((segment) => segment.amount > 0);

  return (
    <div className="ledger">
      <div className="ledger__group">
        <h3 className="ledger__group-title">Budget</h3>
        {barSegments.length > 1 ? (
          <div className="ledger__bar" aria-hidden="true">
            {barSegments.map((segment) => (
              <span key={segment.key} className={`ledger__segment ledger__segment--${segment.kind}`} style={{ flexGrow: segment.amount }} />
            ))}
          </div>
        ) : null}
        <dl className="ledger__rows">
          <div className="ledger__row">
            <dt>Original agreed budget</dt>
            <dd>{formatMoney(summary.originalBudget, currency)}</dd>
          </div>
          {summary.additions.map((addition) => (
            <div key={addition.label} className={`ledger__row ledger__row--${addition.kind}`}>
              <dt>{addition.label}</dt>
              <dd>{formatAddedMoney(addition.cost, currency)}</dd>
            </div>
          ))}
          <div className="ledger__row ledger__row--total">
            <dt>Illustrative revised budget</dt>
            <dd>
              {formatMoney(summary.revisedBudget, currency)}
              {summary.addedCost > 0 ? <span className="ledger__percent"> (+{summary.percentIncrease}%)</span> : null}
            </dd>
          </div>
        </dl>
      </div>

      <div className="ledger__group">
        <h3 className="ledger__group-title">Completion date</h3>
        <dl className="ledger__rows">
          <div className="ledger__row">
            <dt>Original target date</dt>
            <dd>{formatDate(summary.originalEndDate)}</dd>
          </div>
          {summary.additions.map((addition) => (
            <div key={addition.label} className={`ledger__row ledger__row--${addition.kind}`}>
              <dt>{addition.label}</dt>
              <dd>{formatDays(addition.days)}</dd>
            </div>
          ))}
          <div className="ledger__row ledger__row--total">
            <dt>Illustrative revised date</dt>
            <dd>{summary.revisedEndDate ? formatDate(summary.revisedEndDate) : 'Cannot be calculated'}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
