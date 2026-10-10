import { useMemo, useState } from 'react';
import { ChangeRequestItem } from '../components/ChangeRequestItem';
import { ImpactLedger } from '../components/ImpactLedger';
import { ScopeItemList } from '../components/ScopeItemList';
import { Button, ButtonLink } from '../components/ui/Button';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { EmptyState } from '../components/ui/EmptyState';
import { PageHeader } from '../components/ui/PageHeader';
import { Panel } from '../components/ui/Panel';
import { ProjectStatusBadge } from '../components/ui/StatusBadge';
import { summarizeProjectChanges } from '../lib/calculations';
import { formatDate } from '../lib/dates';
import { sortNewestFirst } from '../lib/filters';
import { formatMoney } from '../lib/money';
import { PROJECT_STATUS_LABELS } from '../lib/statusRules';
import { routes } from '../lib/router';
import { pluralize } from '../lib/text';
import { navigate } from '../lib/useRoute';
import { useAppData } from '../state/AppContext';
import { useAppActions } from '../state/useAppActions';
import { NotFoundPage } from './NotFoundPage';

export function ProjectDetailPage({ projectId }: { projectId: string }) {
  const { data } = useAppData();
  const actions = useAppActions();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const project = data.projects.find((p) => p.id === projectId);
  const changes = useMemo(
    () => sortNewestFirst(data.changeRequests.filter((change) => change.projectId === projectId)),
    [data.changeRequests, projectId],
  );
  const summary = useMemo(() => (project ? summarizeProjectChanges(project, changes) : null), [project, changes]);

  if (!project || !summary) {
    return <NotFoundPage title="Project not found" message="This project does not exist. It may have been deleted." />;
  }

  const { counts } = summary;
  const excluded = counts.draft + counts.rejected;

  const handleDelete = () => {
    setConfirmingDelete(false);
    navigate(routes.projects());
    actions.deleteProject(project);
  };

  return (
    <>
      <PageHeader
        back={{ to: routes.projects(), label: 'All projects' }}
        title={project.name}
        description={
          <span className="inline-meta">
            <span>{project.clientName}</span>
            <ProjectStatusBadge status={project.status} />
          </span>
        }
        actions={
          <>
            <ButtonLink to={routes.projectEdit(project.id)} icon="edit">Edit project</ButtonLink>
            <Button variant="danger" icon="trash" onClick={() => setConfirmingDelete(true)}>Delete project</Button>
          </>
        }
      />

      <div className="section">
        <Panel
          id="impact"
          title="Impact of changes on the agreement"
          intro={
            excluded > 0
              ? `Includes approved (demo) and pending changes. ${pluralize(excluded, 'draft or rejected request')} not counted.`
              : 'Includes approved (demo) and pending changes. Figures are illustrative.'
          }
        >
          <ImpactLedger summary={summary.impact} />
        </Panel>
      </div>

      <div className="section split">
        <Panel
          id="original"
          variant="agreed"
          icon="lock"
          title="Original agreement"
          intro="The agreement as recorded. Change requests never edit it."
        >
          <p className="project-description">{project.description}</p>
          <dl className="facts facts--stacked">
            <div>
              <dt>Original budget</dt>
              <dd>{formatMoney(project.originalBudget, project.currency)}</dd>
            </div>
            <div>
              <dt>Target completion</dt>
              <dd>{formatDate(project.originalEndDate)}</dd>
            </div>
            <div>
              <dt>Project status</dt>
              <dd>{PROJECT_STATUS_LABELS[project.status]}</dd>
            </div>
          </dl>
          <h3 className="subheading">Original scope ({project.scopeItems.length})</h3>
          {project.scopeItems.length === 0 ? (
            <EmptyState icon="layers" title="No scope items recorded" actions={<ButtonLink to={routes.projectEdit(project.id)} icon="edit">Add scope items</ButtonLink>}>
              List what was agreed, so proposed changes can be compared against it.
            </EmptyState>
          ) : (
            <ScopeItemList items={project.scopeItems} />
          )}
        </Panel>

        <Panel
          id="proposed"
          variant="proposed"
          icon="changes"
          title={`Proposed changes (${changes.length})`}
          intro="Requests for work beyond the original agreement. Nothing here is agreed until it is approved."
          actions={<ButtonLink to={routes.changeNew(project.id)} variant="primary" size="sm" icon="plus">New change request</ButtonLink>}
        >
          {changes.length === 0 ? (
            <EmptyState icon="changes" title="No change requests yet" actions={<ButtonLink to={routes.changeNew(project.id)} variant="primary" icon="plus">Create a change request</ButtonLink>}>
              If the client asks for something outside the scope above, record it here before starting the work.
            </EmptyState>
          ) : (
            <ul className="stack">
              {changes.map((change) => (
                <ChangeRequestItem key={change.id} change={change} project={project} />
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <ConfirmDialog
        open={confirmingDelete}
        title={`Delete "${project.name}"?`}
        confirmLabel="Delete project"
        onCancel={() => setConfirmingDelete(false)}
        onConfirm={handleDelete}
      >
        This permanently removes the project, its {pluralize(project.scopeItems.length, 'scope item')} and its {pluralize(changes.length, 'change request')} from this browser. This cannot be undone.
      </ConfirmDialog>
    </>
  );
}
