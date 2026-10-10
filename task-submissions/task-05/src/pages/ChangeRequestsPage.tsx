import { useMemo, useState } from 'react';
import { ChangeRequestItem } from '../components/ChangeRequestItem';
import { Button, ButtonLink } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { SearchField, SelectField } from '../components/ui/Field';
import { PageHeader } from '../components/ui/PageHeader';
import { filterChangeRequests, sortNewestFirst } from '../lib/filters';
import { routes } from '../lib/router';
import { CHANGE_STATUS_LABELS } from '../lib/statusRules';
import { pluralize } from '../lib/text';
import { useAppData } from '../state/AppContext';
import { indexById } from '../state/selectors';
import { CHANGE_STATUSES, type ChangeStatus } from '../types';

export function ChangeRequestsPage() {
  const { data } = useAppData();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<ChangeStatus | 'all'>('all');
  const [projectId, setProjectId] = useState('all');

  const projectsById = useMemo(() => indexById(data.projects), [data.projects]);
  const visible = useMemo(
    () => sortNewestFirst(filterChangeRequests(data.changeRequests, projectsById, { query, status, projectId })),
    [data.changeRequests, projectsById, query, status, projectId],
  );
  const isFiltering = query.trim() !== '' || status !== 'all' || projectId !== 'all';
  const clearFilters = () => {
    setQuery('');
    setStatus('all');
    setProjectId('all');
  };

  const canCreate = data.projects.length > 0;

  return (
    <>
      <PageHeader
        title="Change requests"
        description="Every proposed change across all projects. Nothing here edits an original agreement."
        actions={canCreate ? <ButtonLink to={routes.changeNew()} variant="primary" icon="plus">New change request</ButtonLink> : undefined}
      />

      {data.changeRequests.length === 0 ? (
        <EmptyState
          level={2}
          icon="changes"
          title="No change requests yet"
          actions={
            canCreate ? (
              <ButtonLink to={routes.changeNew()} variant="primary" icon="plus">New change request</ButtonLink>
            ) : (
              <ButtonLink to={routes.projectNew()} variant="primary" icon="plus">Create a project first</ButtonLink>
            )
          }
        >
          {canCreate
            ? 'When a client asks for something outside the original scope, record it here before starting the work.'
            : 'Change requests belong to a project. Create a project, then record changes against it.'}
        </EmptyState>
      ) : (
        <>
          <div className="filter-bar filter-bar--three">
            <SearchField id="change-search" label="Search change requests" value={query} onChange={setQuery} placeholder="Title, description or project" />
            <SelectField
              id="change-status-filter"
              label="Status"
              value={status}
              onChange={(value) => setStatus(value as ChangeStatus | 'all')}
              options={[{ value: 'all', label: 'All statuses' }, ...CHANGE_STATUSES.map((s) => ({ value: s, label: CHANGE_STATUS_LABELS[s] }))]}
            />
            <SelectField
              id="change-project-filter"
              label="Project"
              value={projectId}
              onChange={setProjectId}
              options={[{ value: 'all', label: 'All projects' }, ...data.projects.map((p) => ({ value: p.id, label: p.name }))]}
            />
          </div>
          <p className="result-count" role="status">
            Showing {visible.length} of {pluralize(data.changeRequests.length, 'change request')}
          </p>

          {visible.length === 0 ? (
            <EmptyState level={2} icon="search" title="No change requests match" actions={<Button icon="x" onClick={clearFilters}>Clear search and filters</Button>}>
              {isFiltering ? 'Try different words, or choose another status or project.' : 'There are no change requests to show.'}
            </EmptyState>
          ) : (
            <>
              <h2 className="sr-only">Change request list</h2>
              <ul className="stack">
              {visible.map((change) => (
                <ChangeRequestItem key={change.id} change={change} project={projectsById.get(change.projectId)} showProject />
              ))}
              </ul>
            </>
          )}
        </>
      )}
    </>
  );
}
