import { useState, type FormEvent } from 'react';
import { ScopeItemsEditor } from '../components/ScopeItemsEditor';
import { Button, ButtonLink } from '../components/ui/Button';
import { ErrorSummary } from '../components/ui/ErrorSummary';
import { SelectField, TextAreaField, TextField } from '../components/ui/Field';
import { PageHeader } from '../components/ui/PageHeader';
import { routes } from '../lib/router';
import { PROJECT_STATUS_LABELS } from '../lib/statusRules';
import { navigate } from '../lib/useRoute';
import { PROJECT_FIELD, validateProject, type FieldErrors, type ProjectDraft } from '../lib/validation';
import { useAppData } from '../state/AppContext';
import { useAppActions } from '../state/useAppActions';
import { CURRENCIES, PROJECT_STATUSES, type Project, type ScopeItem } from '../types';
import { NotFoundPage } from './NotFoundPage';

const EMPTY_DRAFT: ProjectDraft = {
  name: '',
  clientName: '',
  description: '',
  currency: 'USD',
  budget: '',
  endDate: '',
  status: 'planning',
  scopeItems: [],
};

function draftFromProject(project: Project): ProjectDraft {
  return {
    name: project.name,
    clientName: project.clientName,
    description: project.description,
    currency: project.currency,
    budget: String(project.originalBudget),
    endDate: project.originalEndDate,
    status: project.status,
    scopeItems: project.scopeItems.map((item) => ({ ...item })),
  };
}

export function ProjectFormPage({ projectId }: { projectId?: string }) {
  const { data } = useAppData();
  const existing = projectId ? data.projects.find((p) => p.id === projectId) : undefined;
  if (projectId && !existing) {
    return <NotFoundPage title="Project not found" message="This project does not exist, so it cannot be edited." />;
  }
  // `key` makes sure a different project always starts with its own fresh form state.
  return <ProjectForm key={existing?.id ?? 'new'} existing={existing} />;
}

function ProjectForm({ existing }: { existing: Project | undefined }) {
  const { data } = useAppData();
  const actions = useAppActions();
  const [draft, setDraft] = useState<ProjectDraft>(() => (existing ? draftFromProject(existing) : EMPTY_DRAFT));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [attempt, setAttempt] = useState(0);

  const isEdit = existing !== undefined;
  const currencyLocked = existing !== undefined && data.changeRequests.some((change) => change.projectId === existing.id);
  const backTo = existing ? routes.projectDetail(existing.id) : routes.projects();

  const clearErrors = (...ids: string[]) =>
    setErrors((current) => {
      if (!ids.some((id) => id in current)) return current;
      const next = { ...current };
      ids.forEach((id) => delete next[id]);
      return next;
    });

  const setField = <K extends keyof ProjectDraft>(key: K, fieldId: string, value: ProjectDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
    clearErrors(fieldId);
  };

  const updateScopeItem = (id: string, patch: Partial<Pick<ScopeItem, 'title' | 'description'>>) => {
    setDraft((current) => ({ ...current, scopeItems: current.scopeItems.map((item) => (item.id === id ? { ...item, ...patch } : item)) }));
    clearErrors(`scope-${id}-title`, `scope-${id}-description`);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = validateProject(draft);
    if (!result.ok) {
      setErrors(result.errors);
      setAttempt((n) => n + 1);
      return;
    }
    if (existing) {
      actions.updateProject(existing.id, result.value);
      navigate(routes.projectDetail(existing.id));
    } else {
      const created = actions.createProject(result.value);
      navigate(routes.projectDetail(created.id));
    }
  };

  return (
    <>
      <PageHeader
        back={{ to: backTo, label: isEdit ? 'Back to project' : 'All projects' }}
        title={existing ? `Edit ${existing.name}` : 'New project'}
        description={isEdit ? 'Changes here update the original agreement. Use a change request for new work.' : 'Record the original agreement before any extra work is requested.'}
      />

      <form className="form" onSubmit={handleSubmit} noValidate>
        <ErrorSummary errors={errors} attempt={attempt} />

        <fieldset className="form-section">
          <legend>Project details</legend>
          <TextField id={PROJECT_FIELD.name} label="Project name" required autoComplete="off" value={draft.name} error={errors[PROJECT_FIELD.name]} onChange={(v) => setField('name', PROJECT_FIELD.name, v)} />
          <TextField id={PROJECT_FIELD.client} label="Client name" required autoComplete="organization" value={draft.clientName} error={errors[PROJECT_FIELD.client]} onChange={(v) => setField('clientName', PROJECT_FIELD.client, v)} />
          <TextAreaField id={PROJECT_FIELD.description} label="Description" required hint="One or two sentences about what you are building. Up to 500 characters." value={draft.description} error={errors[PROJECT_FIELD.description]} onChange={(v) => setField('description', PROJECT_FIELD.description, v)} />
          <SelectField
            id={PROJECT_FIELD.status}
            label="Project status"
            value={draft.status}
            error={errors[PROJECT_FIELD.status]}
            onChange={(v) => setField('status', PROJECT_FIELD.status, v)}
            options={PROJECT_STATUSES.map((s) => ({ value: s, label: PROJECT_STATUS_LABELS[s] }))}
          />
        </fieldset>

        <fieldset className="form-section">
          <legend>Original agreement</legend>
          <div className="form-grid">
            <SelectField
              id={PROJECT_FIELD.currency}
              label="Currency"
              required
              disabled={currencyLocked}
              hint={currencyLocked ? 'Locked because this project has change requests. ScopeBridge does not convert currencies.' : 'Used for every amount in this project.'}
              value={draft.currency}
              error={errors[PROJECT_FIELD.currency]}
              onChange={(v) => setField('currency', PROJECT_FIELD.currency, v)}
              options={CURRENCIES.map((c) => ({ value: c, label: c }))}
            />
            <TextField id={PROJECT_FIELD.budget} label="Original agreed budget" required inputMode="decimal" placeholder="8500" hint="Digits only, for example 8500 or 8,500.50." value={draft.budget} error={errors[PROJECT_FIELD.budget]} onChange={(v) => setField('budget', PROJECT_FIELD.budget, v)} />
            <TextField id={PROJECT_FIELD.endDate} label="Original target completion date" required type="date" min="2000-01-01" max="2100-12-31" value={draft.endDate} error={errors[PROJECT_FIELD.endDate]} onChange={(v) => setField('endDate', PROJECT_FIELD.endDate, v)} />
          </div>
        </fieldset>

        <fieldset className="form-section">
          <legend>Original scope</legend>
          <ScopeItemsEditor
            items={draft.scopeItems}
            errors={errors}
            onAdd={(item) => setDraft((current) => ({ ...current, scopeItems: [...current.scopeItems, item] }))}
            onChange={updateScopeItem}
            onRemove={(id) => {
              setDraft((current) => ({ ...current, scopeItems: current.scopeItems.filter((item) => item.id !== id) }));
              clearErrors(`scope-${id}-title`, `scope-${id}-description`);
            }}
          />
        </fieldset>

        <div className="form-actions">
          <Button type="submit" variant="primary" icon="check">{isEdit ? 'Save changes' : 'Create project'}</Button>
          <ButtonLink to={backTo}>Cancel</ButtonLink>
        </div>
      </form>
    </>
  );
}
