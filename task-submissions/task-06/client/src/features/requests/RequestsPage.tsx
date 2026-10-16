import { useEffect, useRef, useState } from 'react';
import { createRequest, deleteRequest, PAGE_SIZE, updateRequest } from '../../api/requests';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { Modal } from '../../components/Modal';
import {
  EMPTY_FORM_VALUES,
  type RequestFormValues,
  type RequestPayload,
  type ServiceRequest,
} from '../../types/serviceRequest';
import { FlowSummary } from './FlowSummary';
import { RequestDetails } from './RequestDetails';
import { RequestFilters } from './RequestFilters';
import { RequestForm } from './RequestForm';
import { RequestList } from './RequestList';
import { useRequests } from './useRequests';

type DialogState =
  | null
  | { type: 'create' }
  | { type: 'details'; id: string }
  | { type: 'edit'; request: ServiceRequest }
  | { type: 'delete'; request: ServiceRequest };

interface Notice {
  kind: 'success' | 'error';
  message: string;
}

function toFormValues(request: ServiceRequest): RequestFormValues {
  return {
    title: request.title,
    description: request.description,
    category: request.category,
    priority: request.priority,
    status: request.status,
    requesterName: request.requesterName,
    requesterEmail: request.requesterEmail,
  };
}

export function RequestsPage() {
  const requests = useRequests();
  const [dialog, setDialog] = useState<DialogState>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  const headingRef = useRef<HTMLHeadingElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const dialogWasOpen = useRef(false);

  // Return keyboard focus to where the user was when a dialog closes.
  useEffect(() => {
    if (dialog) {
      dialogWasOpen.current = true;
      return;
    }
    if (!dialogWasOpen.current) return;
    dialogWasOpen.current = false;
    const trigger = triggerRef.current;
    if (trigger && trigger.isConnected) trigger.focus();
    else headingRef.current?.focus();
  }, [dialog]);

  function openDialog(next: Exclude<DialogState, null>) {
    if (!dialog) triggerRef.current = document.activeElement as HTMLElement | null;
    setDialog(next);
  }

  function closeDialog() {
    setDialog(null);
  }

  function showNotice(kind: Notice['kind'], message: string) {
    setNotice({ kind, message });
  }

  async function handleCreate(payload: RequestPayload) {
    await createRequest(payload);
    closeDialog();
    showNotice('success', 'Request created.');
    requests.setPage(1);
    requests.reload();
  }

  async function handleUpdate(id: string, payload: RequestPayload) {
    await updateRequest(id, payload);
    closeDialog();
    showNotice('success', 'Request updated.');
    requests.reload();
  }

  async function handleDelete(request: ServiceRequest) {
    await deleteRequest(request.id);
    closeDialog();
    showNotice('success', 'Request deleted.');
    requests.reload();
  }

  const { items, meta, error, hasLoaded, isFetching, filters, hasActiveFilters, page } = requests;
  const hasNoRequestsAtAll =
    hasLoaded && !error && items.length === 0 && !hasActiveFilters && (meta?.total ?? 0) === 0;
  const hasNoMatches = hasLoaded && !error && items.length === 0 && hasActiveFilters;

  return (
    <main className="page" id="main">
      <div className="page-head">
        <div>
          <h1 ref={headingRef} tabIndex={-1}>
            Service requests
          </h1>
          <p className="muted">Track IT, maintenance, electrical and plumbing issues in one place.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => openDialog({ type: 'create' })}>
          New request
        </button>
      </div>

      {notice && (
        <div className={`alert alert-${notice.kind === 'success' ? 'success' : 'error'} notice`} role={notice.kind === 'success' ? 'status' : 'alert'}>
          <span>{notice.message}</span>
          <button type="button" className="btn btn-ghost btn-small" onClick={() => setNotice(null)}>
            Dismiss
          </button>
        </div>
      )}

      <FlowSummary
        meta={meta}
        activeStatus={filters.status}
        onSelectStatus={(status) => requests.updateFilters({ status })}
      />

      <RequestFilters
        filters={filters}
        hasActiveFilters={hasActiveFilters}
        onChange={requests.updateFilters}
        onClear={requests.clearFilters}
      />

      <section className="results" aria-label="Request results" aria-busy={isFetching}>
        {error && (
          <div className="alert alert-error notice" role="alert">
            <span>{error}</span>
            <button type="button" className="btn btn-secondary btn-small" onClick={requests.reload}>
              Try again
            </button>
          </div>
        )}

        {!hasLoaded && !error && (
          <p className="state-block" role="status">
            Loading requests...
          </p>
        )}

        {hasNoRequestsAtAll && (
          <div className="state-block">
            <h2>No service requests yet</h2>
            <p className="muted">Create the first request to start tracking work.</p>
            <button type="button" className="btn btn-primary" onClick={() => openDialog({ type: 'create' })}>
              Create the first request
            </button>
          </div>
        )}

        {hasNoMatches && (
          <div className="state-block">
            <h2>No requests match these filters</h2>
            <p className="muted">Try a different search or remove a filter.</p>
            <button type="button" className="btn btn-secondary" onClick={requests.clearFilters}>
              Clear filters
            </button>
          </div>
        )}

        {items.length > 0 && (
          <div className={isFetching ? 'results-list is-refreshing' : 'results-list'}>
            <RequestList
              items={items}
              onView={(request) => openDialog({ type: 'details', id: request.id })}
              onEdit={(request) => openDialog({ type: 'edit', request })}
              onDelete={(request) => openDialog({ type: 'delete', request })}
            />
            {isFetching && (
              <p className="visually-hidden" role="status">
                Updating results
              </p>
            )}
          </div>
        )}

        {meta && meta.totalPages > 1 && (
          <nav className="pagination" aria-label="Pagination">
            <button type="button" className="btn btn-secondary" disabled={page <= 1} onClick={() => requests.setPage(page - 1)}>
              Previous
            </button>
            <p className="muted">
              Page {page} of {meta.totalPages}, {meta.total} matching (up to {PAGE_SIZE} per page)
            </p>
            <button type="button" className="btn btn-secondary" disabled={page >= meta.totalPages} onClick={() => requests.setPage(page + 1)}>
              Next
            </button>
          </nav>
        )}
      </section>

      {dialog?.type === 'create' && (
        <Modal title="New service request" onClose={closeDialog}>
          <RequestForm mode="create" initialValues={EMPTY_FORM_VALUES} onSubmit={handleCreate} onCancel={closeDialog} />
        </Modal>
      )}

      {dialog?.type === 'edit' && (
        <Modal title="Edit service request" onClose={closeDialog}>
          <RequestForm
            mode="edit"
            initialValues={toFormValues(dialog.request)}
            onSubmit={(payload) => handleUpdate(dialog.request.id, payload)}
            onCancel={closeDialog}
          />
        </Modal>
      )}

      {dialog?.type === 'details' && (
        <Modal title="Request details" onClose={closeDialog}>
          <RequestDetails
            id={dialog.id}
            onClose={closeDialog}
            onEdit={(request) => setDialog({ type: 'edit', request })}
            onDelete={(request) => setDialog({ type: 'delete', request })}
          />
        </Modal>
      )}

      {dialog?.type === 'delete' && (
        <ConfirmDialog
          title="Delete this request?"
          confirmLabel="Delete request"
          busyLabel="Deleting..."
          onConfirm={() => handleDelete(dialog.request)}
          onCancel={closeDialog}
        >
          <p>
            <strong>{dialog.request.title}</strong> will be permanently removed. This cannot be undone.
          </p>
        </ConfirmDialog>
      )}
    </main>
  );
}
