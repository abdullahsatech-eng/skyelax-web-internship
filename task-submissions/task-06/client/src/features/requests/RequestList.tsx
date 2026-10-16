import { useMediaQuery } from '../../hooks/useMediaQuery';
import { CATEGORY_LABELS, type ServiceRequest } from '../../types/serviceRequest';
import { formatDate } from '../../utils/format';
import { PriorityBadge, StatusBadge } from './Badges';

interface RequestListProps {
  items: ServiceRequest[];
  onView: (request: ServiceRequest) => void;
  onEdit: (request: ServiceRequest) => void;
  onDelete: (request: ServiceRequest) => void;
}

function RowActions({ request, onView, onEdit, onDelete }: { request: ServiceRequest } & Omit<RequestListProps, 'items'>) {
  return (
    <div className="row-actions">
      <button type="button" className="btn btn-secondary btn-small" onClick={() => onView(request)} aria-label={`View ${request.title}`}>
        View
      </button>
      <button type="button" className="btn btn-secondary btn-small" onClick={() => onEdit(request)} aria-label={`Edit ${request.title}`}>
        Edit
      </button>
      <button type="button" className="btn btn-danger-outline btn-small" onClick={() => onDelete(request)} aria-label={`Delete ${request.title}`}>
        Delete
      </button>
    </div>
  );
}

/** A table on wide screens (over 1120px), cards below that. Only one is rendered at a time. */
export function RequestList({ items, onView, onEdit, onDelete }: RequestListProps) {
  const narrow = useMediaQuery('(max-width: 1120px)');

  if (narrow) {
    return (
      <ul className="card-list">
        {items.map((request) => (
          <li key={request.id}>
            <article className="request-card">
              <h3>{request.title}</h3>
              <div className="badge-row">
                <StatusBadge status={request.status} />
                <PriorityBadge priority={request.priority} />
              </div>
              <dl className="meta-list">
                <div>
                  <dt>Category</dt>
                  <dd>{CATEGORY_LABELS[request.category]}</dd>
                </div>
                <div>
                  <dt>Requester</dt>
                  <dd>{request.requesterName}</dd>
                </div>
                <div>
                  <dt>Created</dt>
                  <dd>{formatDate(request.createdAt)}</dd>
                </div>
              </dl>
              <RowActions request={request} onView={onView} onEdit={onEdit} onDelete={onDelete} />
            </article>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="table-wrap">
      <table className="request-table">
        <caption className="visually-hidden">Service requests</caption>
        <thead>
          <tr>
            <th scope="col">Request</th>
            <th scope="col">Category</th>
            <th scope="col">Priority</th>
            <th scope="col">Status</th>
            <th scope="col">Requester</th>
            <th scope="col">Created</th>
            <th scope="col">
              <span className="visually-hidden">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((request) => (
            <tr key={request.id}>
              <th scope="row" className="cell-title">
                {request.title}
              </th>
              <td>{CATEGORY_LABELS[request.category]}</td>
              <td>
                <PriorityBadge priority={request.priority} />
              </td>
              <td>
                <StatusBadge status={request.status} />
              </td>
              <td>{request.requesterName}</td>
              <td>{formatDate(request.createdAt)}</td>
              <td>
                <RowActions request={request} onView={onView} onEdit={onEdit} onDelete={onDelete} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
