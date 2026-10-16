import { STATUSES, STATUS_LABELS, type ListMeta, type Status } from '../../types/serviceRequest';

interface FlowSummaryProps {
  meta: ListMeta | null;
  activeStatus: Status | '';
  onSelectStatus: (status: Status | '') => void;
}

/** Shows how requests are spread across statuses, from live API counts. */
export function FlowSummary({ meta, activeStatus, onSelectStatus }: FlowSummaryProps) {
  const counts = meta?.statusCounts;
  const total = counts ? STATUSES.reduce((sum, status) => sum + counts[status], 0) : 0;

  return (
    <section className="flow" aria-labelledby="flow-heading">
      <div className="flow-head">
        <h2 id="flow-heading">Request flow</h2>
        <p className="muted">
          {counts ? `${total} ${total === 1 ? 'request' : 'requests'} in total` : 'Loading counts'}
        </p>
      </div>

      <div className="flow-bar" aria-hidden="true">
        {counts &&
          total > 0 &&
          STATUSES.filter((status) => counts[status] > 0).map((status) => (
            <span key={status} className={`flow-segment status-${status}`} style={{ flexGrow: counts[status] }} />
          ))}
      </div>

      <ul className="flow-legend">
        {STATUSES.map((status) => {
          const active = activeStatus === status;
          return (
            <li key={status}>
              <button
                type="button"
                className={`flow-chip status-${status}`}
                aria-pressed={active}
                onClick={() => onSelectStatus(active ? '' : status)}
              >
                <span className="flow-count">{counts ? counts[status] : '-'}</span>
                <span>{STATUS_LABELS[status]}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
