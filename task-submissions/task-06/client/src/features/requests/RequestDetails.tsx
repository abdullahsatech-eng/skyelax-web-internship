import { useEffect, useState } from 'react';
import { isAbortError } from '../../api/http';
import { getRequest } from '../../api/requests';
import { CATEGORY_LABELS, type ServiceRequest } from '../../types/serviceRequest';
import { formatDateTime } from '../../utils/format';
import { messageFromError } from '../../utils/errors';
import { PriorityBadge, StatusBadge } from './Badges';

interface RequestDetailsProps {
  id: string;
  onEdit: (request: ServiceRequest) => void;
  onDelete: (request: ServiceRequest) => void;
  onClose: () => void;
}

/** Fetches one request from the API (GET /requests/:id) and shows its full details. */
export function RequestDetails({ id, onEdit, onDelete, onClose }: RequestDetailsProps) {
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setError(null);
    setRequest(null);
    getRequest(id, controller.signal)
      .then(setRequest)
      .catch((caught: unknown) => {
        if (!isAbortError(caught)) setError(messageFromError(caught));
      });
    return () => controller.abort();
  }, [id, attempt]);

  if (error) {
    return (
      <div className="stack">
        <p className="alert alert-error" role="alert">
          {error}
        </p>
        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <button type="button" className="btn btn-primary" onClick={() => setAttempt((n) => n + 1)}>
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <p className="state-inline" role="status">
        Loading request details...
      </p>
    );
  }

  return (
    <div className="stack">
      <div>
        <h3 className="details-title">{request.title}</h3>
        <div className="badge-row">
          <StatusBadge status={request.status} />
          <PriorityBadge priority={request.priority} />
        </div>
      </div>
      <p className="details-description">{request.description}</p>
      <dl className="meta-list meta-list-grid">
        <div>
          <dt>Category</dt>
          <dd>{CATEGORY_LABELS[request.category]}</dd>
        </div>
        <div>
          <dt>Requester</dt>
          <dd>{request.requesterName}</dd>
        </div>
        <div>
          <dt>Requester email</dt>
          <dd>{request.requesterEmail}</dd>
        </div>
        <div>
          <dt>Created</dt>
          <dd>{formatDateTime(request.createdAt)}</dd>
        </div>
        <div>
          <dt>Last updated</dt>
          <dd>{formatDateTime(request.updatedAt)}</dd>
        </div>
      </dl>
      <div className="modal-actions">
        <button type="button" className="btn btn-secondary" onClick={onClose} data-autofocus>
          Close
        </button>
        <button type="button" className="btn btn-danger-outline" onClick={() => onDelete(request)}>
          Delete request
        </button>
        <button type="button" className="btn btn-primary" onClick={() => onEdit(request)}>
          Edit request
        </button>
      </div>
    </div>
  );
}
