import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  type Priority,
  type Status,
} from '../../types/serviceRequest';

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`badge badge-status status-${status}`}>
      <span className="badge-dot" aria-hidden="true" />
      {STATUS_LABELS[status]}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return <span className={`badge badge-priority priority-${priority}`}>{PRIORITY_LABELS[priority]}</span>;
}
