import { useMemo, useState, type FormEvent } from 'react';
import { ImpactLedger } from '../components/ImpactLedger';
import { Button, ButtonLink } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorSummary } from '../components/ui/ErrorSummary';
import { SelectField, TextAreaField, TextField } from '../components/ui/Field';
import { Icon } from '../components/ui/Icon';
import { PageHeader } from '../components/ui/PageHeader';
import { Panel } from '../components/ui/Panel';
import { buildImpactSummary } from '../lib/calculations';
import { routes } from '../lib/router';
import { CHANGE_STATUS_LABELS, isEditable } from '../lib/statusRules';
import { navigate, useRoute } from '../lib/useRoute';
import { CHANGE_FIELD, checkCostText, checkDaysText, validateChange, type ChangeDraft, type FieldErrors } from '../lib/validation';
import { useAppData } from '../state/AppContext';
import { useAppActions } from '../state/useAppActions';
import type { ChangeRequest } from '../types';
import { NotFoundPage } from './NotFoundPage';

export function ChangeFormPage({ changeId }: { changeId?: string }) {
  const { data } = useAppData();
  const route = useRoute();
  const existing = changeId ? data.changeRequests.find((c) => c.id === changeId) : undefined;

  if (changeId && !existing) {
    return <NotFoundPage title="Change request not found" message="This change request does not exist, so it cannot be edited." />;
  }
  if (existing && !isEditable(existing.status)) {
    return (
      <>
        <PageHeader back={{ to: routes.changeDetail(existing.id), label: 'Back to change request' }} title="This change is locked" />
        <EmptyState level={2} icon="lock" title={`${CHANGE_STATUS_LABELS[existing.status]} changes cannot be edited`} actions={<ButtonLink to={routes.changeDetail(existing.id)} variant="primary">Open change request</ButtonLink>}>
          Reopen it for review from its page first. That keeps every decision visible instead of rewriting it silently.
        </EmptyState>
      </>
    );
  }
  if (!existing && data.projects.length === 0) {
    return (
      <>
        <PageHeader back={{ to: routes.changes(), label: 'Change requests' }} title="New change request" />
        <EmptyState level={2} title="Create a project first" actions={<ButtonLink to={routes.projectNew()} variant="primary" icon="plus">New project</ButtonLink>}>
          A change request is compared against a project&apos;s original agreement, so it needs a project to belong to.
        </EmptyState>
      </>
    );
  }

  const preselected = route.query.get('project') ?? '';
  return <ChangeForm key={existing?.id ?? `new-${preselected}`} existing={existing} preselectedProjectId={preselected} />;
}

function ChangeForm({ existing, preselectedProjectId }: { existing: ChangeRequest | undefined; preselectedProjectId: string }) {
  const { data } = useAppData();
  const actions = useAppActions();

  const [draft, setDraft] = useState<ChangeDraft>(() => {
    if (existing) {
      return {
        projectId: existing.projectId,
        title: existing.title,
        description: existing.description,
        cost: String(existing.costAdjustment),
        days: String(existing.scheduleImpactDays),
      };
    }
    const valid = data.projects.some((p) => p.id === preselectedProjectId);
    return { projectId: valid ? preselectedProjectId : '', title: '', description: '', cost: '', days: '' };
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [attempt, setAttempt] = useState(0);

  const project = data.projects.find((p) => p.id === draft.projectId);
  const backTo = existing ? routes.changeDetail(existing.id) : project ? routes.projectDetail(project.id) : routes.changes();
  const backLabel = existing ? 'Back to change request' : project ? `Back to ${project.name}` : 'All change requests';

  const setField = <K extends keyof ChangeDraft>(key: K, fieldId: string, value: ChangeDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!(fieldId in current)) return current;
      const next = { ...current };
      delete next[fieldId];
      return next;
    });
  };

  // Live preview: only shown when both numbers are valid, so it never displays NaN or guesses.
  const preview = useMemo(() => {
    if (!project) return null;
    const cost = checkCostText(draft.cost);
    const days = checkDaysText(draft.days);
    if (!('value' in cost) || !('value' in days)) return null;
    return buildImpactSummary(project, [{ label: 'This proposed change', kind: 'proposed', cost: cost.value, days: days.value }]);
  }, [project, draft.cost, draft.days]);

  const submit = (intent: 'draft' | 'review') => {
    const result = validateChange(draft, data.projects);
    if (!result.ok) {
      setErrors(result.errors);
      setAttempt((n) => n + 1);
      return;
    }
    if (existing) {
      const { title, description, costAdjustment, scheduleImpactDays } = result.value;
      actions.updateChange(existing.id, title, { title, description, costAdjustment, scheduleImpactDays });
      navigate(routes.changeDetail(existing.id));
    } else {
      const created = actions.createChange(result.value, intent === 'review' ? 'pending_review' : 'draft');
      navigate(routes.changeDetail(created.id));
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submit('draft'); // Enter key saves a draft: the safest default, because nothing is sent for review.
  };

  const currencyLabel = project ? ` (${project.currency})` : '';

  return (
    <>
      <PageHeader
        back={{ to: backTo, label: backLabel }}
        title={existing ? 'Edit change request' : 'New change request'}
        description="Describe the extra work and what it would add. The original agreement stays unchanged."
      />

      <div className="split split--form">
        <form className="form" onSubmit={handleSubmit} noValidate>
          <ErrorSummary errors={errors} attempt={attempt} />

          <fieldset className="form-section">
            <legend>What is being requested</legend>
            <SelectField
              id={CHANGE_FIELD.project}
              label="Project"
              required
              placeholder="Choose a project"
              disabled={existing !== undefined}
              hint={existing ? 'A change request cannot be moved to another project.' : undefined}
              value={draft.projectId}
              error={errors[CHANGE_FIELD.project]}
              onChange={(v) => setField('projectId', CHANGE_FIELD.project, v)}
              options={data.projects.map((p) => ({ value: p.id, label: `${p.name} (${p.clientName})` }))}
            />
            <TextField id={CHANGE_FIELD.title} label="Title" required autoComplete="off" value={draft.title} error={errors[CHANGE_FIELD.title]} onChange={(v) => setField('title', CHANGE_FIELD.title, v)} />
            <TextAreaField id={CHANGE_FIELD.description} label="Description" required hint="What does the client want, and what does it involve? Up to 1,000 characters." value={draft.description} error={errors[CHANGE_FIELD.description]} onChange={(v) => setField('description', CHANGE_FIELD.description, v)} />
          </fieldset>

          <fieldset className="form-section">
            <legend>Proposed impact</legend>
            <div className="form-grid">
              <TextField
                id={CHANGE_FIELD.cost}
                label={`Proposed additional cost${currencyLabel}`}
                required
                inputMode="decimal"
                placeholder="1200"
                hint="Enter 0 if the change only affects the schedule."
                value={draft.cost}
                error={errors[CHANGE_FIELD.cost]}
                onChange={(v) => setField('cost', CHANGE_FIELD.cost, v)}
              />
              <TextField
                id={CHANGE_FIELD.days}
                label="Schedule extension (days)"
                required
                inputMode="numeric"
                placeholder="5"
                hint="Enter 0 if the deadline does not move."
                value={draft.days}
                error={errors[CHANGE_FIELD.days]}
                onChange={(v) => setField('days', CHANGE_FIELD.days, v)}
              />
            </div>
          </fieldset>

          <div className="form-actions">
            {existing ? (
              <Button type="submit" variant="primary" icon="check">Save changes</Button>
            ) : (
              <>
                <Button type="submit" variant="primary" icon="check">Save as draft</Button>
                <Button icon="send" onClick={() => submit('review')}>Save and send for review</Button>
              </>
            )}
            <ButtonLink to={backTo}>Cancel</ButtonLink>
          </div>
        </form>

        <aside className="preview">
          <Panel id="preview" variant="proposed" title="Impact preview" intro="Updates as you type. Illustrative only.">
            {preview ? (
              <ImpactLedger summary={preview} />
            ) : (
              <p className="callout">
                <Icon name="info" size={16} />
                <span>{project ? 'Enter a valid cost and number of days to see the effect on the budget and the target date.' : 'Choose a project to compare this change with its original agreement.'}</span>
              </p>
            )}
          </Panel>
        </aside>
      </div>
    </>
  );
}
