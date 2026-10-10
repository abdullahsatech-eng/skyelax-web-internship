import { useMemo, useState } from 'react';
import { ChangeStatusActions } from '../components/ChangeStatusActions';
import { ImpactLedger } from '../components/ImpactLedger';
import { Button, ButtonLink } from '../components/ui/Button';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Icon } from '../components/ui/Icon';
import { Link } from '../components/ui/Link';
import { PageHeader } from '../components/ui/PageHeader';
import { Panel } from '../components/ui/Panel';
import { ChangeStatusBadge } from '../components/ui/StatusBadge';
import { buildImpactSummary } from '../lib/calculations';
import { formatDate } from '../lib/dates';
import { formatAddedMoney, formatDays } from '../lib/money';
import { routes } from '../lib/router';
import { CHANGE_STATUS_HELP, isEditable } from '../lib/statusRules';
import { navigate } from '../lib/useRoute';
import { useAppData } from '../state/AppContext';
import { useAppActions } from '../state/useAppActions';
import { NotFoundPage } from './NotFoundPage';

export function ChangeDetailPage({ changeId }: { changeId: string }) {
  const { data } = useAppData();
  const actions = useAppActions();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const change = data.changeRequests.find((c) => c.id === changeId);
  const project = change ? data.projects.find((p) => p.id === change.projectId) : undefined;

  const impact = useMemo(() => {
    if (!change || !project) return null;
    const kind = change.status === 'approved' ? 'approved' : 'proposed';
    const label =
      change.status === 'approved' ? 'This change (approved, demo)' : change.status === 'rejected' ? 'This change (rejected, if it had been accepted)' : 'This proposed change';
    return buildImpactSummary(project, [{ label, kind, cost: change.costAdjustment, days: change.scheduleImpactDays }]);
  }, [change, project]);

  if (!change || !project || !impact) {
    return <NotFoundPage title="Change request not found" message="This change request does not exist. It may have been deleted." />;
  }

  const handleDelete = () => {
    setConfirmingDelete(false);
    navigate(routes.projectDetail(project.id));
    actions.deleteChange(change);
  };

  return (
    <>
      <PageHeader
        back={{ to: routes.projectDetail(project.id), label: project.name }}
        title={change.title}
        description={
          <span className="inline-meta">
            <ChangeStatusBadge status={change.status} />
            <span>
              Project: <Link to={routes.projectDetail(project.id)} className="text-link">{project.name}</Link>
            </span>
          </span>
        }
        actions={
          <>
            {isEditable(change.status) ? <ButtonLink to={routes.changeEdit(change.id)} icon="edit">Edit change</ButtonLink> : null}
            <Button variant="danger" icon="trash" onClick={() => setConfirmingDelete(true)}>Delete change</Button>
          </>
        }
      />

      <div className="section split">
        <div className="stack stack--lg">
          <Panel id="status" variant="proposed" icon="clock" title="Status" intro={CHANGE_STATUS_HELP[change.status]}>
            <ChangeStatusActions change={change} />
            {!isEditable(change.status) ? (
              <p className="callout">
                <Icon name="lock" size={16} />
                <span>Approved and rejected changes are locked so a decision is never rewritten silently. Reopen it for review to edit.</span>
              </p>
            ) : null}
          </Panel>

          <Panel id="details" variant="proposed" icon="changes" title="Request details">
            <p className="project-description">{change.description}</p>
            <dl className="facts facts--stacked">
              <div>
                <dt>Proposed additional cost</dt>
                <dd>{change.costAdjustment > 0 ? formatAddedMoney(change.costAdjustment, project.currency) : 'No cost change'}</dd>
              </div>
              <div>
                <dt>Estimated schedule impact</dt>
                <dd>{formatDays(change.scheduleImpactDays)}</dd>
              </div>
              <div>
                <dt>Created</dt>
                <dd>{formatDate(change.createdAt)}</dd>
              </div>
              <div>
                <dt>Last updated</dt>
                <dd>{formatDate(change.updatedAt)}</dd>
              </div>
            </dl>
          </Panel>
        </div>

        <Panel
          id="change-impact"
          title="Effect on the original agreement"
          intro="Compares this one change with the original budget and target date. The original agreement itself is not modified."
        >
          <ImpactLedger summary={impact} />
        </Panel>
      </div>

      <ConfirmDialog
        open={confirmingDelete}
        title={`Delete "${change.title}"?`}
        confirmLabel="Delete change request"
        onCancel={() => setConfirmingDelete(false)}
        onConfirm={handleDelete}
      >
        This permanently removes the change request from this browser. This cannot be undone.
      </ConfirmDialog>
    </>
  );
}
