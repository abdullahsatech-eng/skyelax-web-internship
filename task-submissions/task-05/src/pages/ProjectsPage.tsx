import { useMemo, useState } from 'react';
import { ProjectCard } from '../components/ProjectCard';
import { Button, ButtonLink } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { SearchField, SelectField } from '../components/ui/Field';
import { PageHeader } from '../components/ui/PageHeader';
import { groupChangesByProject } from '../lib/calculations';
import { filterProjects, sortNewestFirst } from '../lib/filters';
import { routes } from '../lib/router';
import { PROJECT_STATUS_LABELS } from '../lib/statusRules';
import { pluralize } from '../lib/text';
import { useAppData } from '../state/AppContext';
import { buildProjectSummaries } from '../state/selectors';
import { PROJECT_STATUSES, type ProjectStatus } from '../types';

export function ProjectsPage() {
  const { data } = useAppData();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<ProjectStatus | 'all'>('all');

  const summaries = useMemo(
    () => buildProjectSummaries(data.projects, groupChangesByProject(data.changeRequests)),
    [data],
  );
  const visible = useMemo(
    () => sortNewestFirst(filterProjects(data.projects, { query, status })),
    [data.projects, query, status],
  );
  const isFiltering = query.trim() !== '' || status !== 'all';
  const clearFilters = () => {
    setQuery('');
    setStatus('all');
  };

  return (
    <>
      <PageHeader
        title="Projects"
        description="Each project holds its original agreement and every change proposed since."
        actions={<ButtonLink to={routes.projectNew()} variant="primary" icon="plus">New project</ButtonLink>}
      />

      {data.projects.length === 0 ? (
        <EmptyState level={2} title="No projects yet" actions={<ButtonLink to={routes.projectNew()} variant="primary" icon="plus">Create a project</ButtonLink>}>
          Add your first project to record its original scope, budget and target date.
        </EmptyState>
      ) : (
        <>
          <div className="filter-bar">
            <SearchField id="project-search" label="Search projects" value={query} onChange={setQuery} placeholder="Name, client or description" />
            <SelectField
              id="project-status-filter"
              label="Status"
              value={status}
              onChange={(value) => setStatus(value as ProjectStatus | 'all')}
              options={[{ value: 'all', label: 'All statuses' }, ...PROJECT_STATUSES.map((s) => ({ value: s, label: PROJECT_STATUS_LABELS[s] }))]}
            />
          </div>
          <p className="result-count" role="status">
            Showing {visible.length} of {pluralize(data.projects.length, 'project')}
          </p>

          {visible.length === 0 ? (
            <EmptyState level={2} icon="search" title="No projects match" actions={<Button icon="x" onClick={clearFilters}>Clear search and filters</Button>}>
              {isFiltering ? 'Try a different word or choose another status.' : 'There are no projects to show.'}
            </EmptyState>
          ) : (
            <>
              <h2 className="sr-only">Project list</h2>
              <ul className="card-grid">
              {visible.map((project) => (
                <ProjectCard key={project.id} project={project} summary={summaries.get(project.id)!} />
              ))}
              </ul>
            </>
          )}
        </>
      )}
    </>
  );
}
