import { describe, expect, it } from 'vitest';
import { makeProject } from '../test/factories';
import {
  CHANGE_FIELD,
  PROJECT_FIELD,
  scopeFieldId,
  validateChange,
  validateProject,
  type ChangeDraft,
  type ProjectDraft,
} from './validation';

const validProject = (): ProjectDraft => ({
  name: '  Site Rebuild ',
  clientName: 'Acme',
  description: 'Rebuild the site.',
  currency: 'USD',
  budget: '8,500',
  endDate: '2026-12-01',
  status: 'planning',
  scopeItems: [{ id: 's1', title: 'Homepage', description: '' }],
});

const validChange = (): ChangeDraft => ({
  projectId: 'p1',
  title: 'Add blog',
  description: 'A blog section.',
  cost: '1200',
  days: '5',
});

describe('validateProject', () => {
  it('accepts valid input and trims text', () => {
    const result = validateProject(validProject());
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.name).toBe('Site Rebuild');
      expect(result.value.originalBudget).toBe(8500);
    }
  });

  it('reports every missing required field with an understandable message', () => {
    const result = validateProject({ ...validProject(), name: ' ', clientName: '', description: '', budget: '', endDate: '' });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(Object.keys(result.errors)).toEqual([
        PROJECT_FIELD.name,
        PROJECT_FIELD.client,
        PROJECT_FIELD.description,
        PROJECT_FIELD.budget,
        PROJECT_FIELD.endDate,
      ]);
    }
  });

  it('rejects zero, negative and non-numeric budgets', () => {
    for (const budget of ['0', '-100', 'abc', '1e6']) {
      const result = validateProject({ ...validProject(), budget });
      expect(result.ok).toBe(false);
    }
  });

  it('rejects impossible dates and out-of-range years', () => {
    expect(validateProject({ ...validProject(), endDate: '2026-02-30' }).ok).toBe(false);
    expect(validateProject({ ...validProject(), endDate: '1999-01-01' }).ok).toBe(false);
  });

  it('validates scope items and keys errors by their field ids', () => {
    const result = validateProject({ ...validProject(), scopeItems: [{ id: 's9', title: '  ', description: '' }] });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors[scopeFieldId('s9', 'title')]).toContain('scope item 1');
  });

  it('allows a project with no scope items', () => {
    expect(validateProject({ ...validProject(), scopeItems: [] }).ok).toBe(true);
  });
});

describe('validateChange', () => {
  const projects = [makeProject({ id: 'p1' })];

  it('accepts valid input', () => {
    const result = validateChange(validChange(), projects);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.costAdjustment).toBe(1200);
      expect(result.value.scheduleImpactDays).toBe(5);
    }
  });

  it('allows a schedule-only change (cost 0, days above 0) and a cost-only change', () => {
    expect(validateChange({ ...validChange(), cost: '0', days: '3' }, projects).ok).toBe(true);
    expect(validateChange({ ...validChange(), cost: '250', days: '0' }, projects).ok).toBe(true);
  });

  it('rejects a change with neither cost nor delay', () => {
    const result = validateChange({ ...validChange(), cost: '0', days: '0' }, projects);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors[CHANGE_FIELD.cost]).toContain('cost, a schedule extension, or both');
  });

  it('rejects negative adjustments with a specific message', () => {
    const cost = validateChange({ ...validChange(), cost: '-50' }, projects);
    const days = validateChange({ ...validChange(), days: '-2' }, projects);
    expect(cost.ok).toBe(false);
    expect(days.ok).toBe(false);
    if (!cost.ok) expect(cost.errors[CHANGE_FIELD.cost]).toContain('Negative');
    if (!days.ok) expect(days.errors[CHANGE_FIELD.days]).toContain('earlier');
  });

  it('rejects NaN-like and fractional input', () => {
    expect(validateChange({ ...validChange(), cost: 'NaN' }, projects).ok).toBe(false);
    expect(validateChange({ ...validChange(), days: '2.5' }, projects).ok).toBe(false);
    expect(validateChange({ ...validChange(), days: '9999' }, projects).ok).toBe(false);
  });

  it('requires an existing project', () => {
    expect(validateChange({ ...validChange(), projectId: '' }, projects).ok).toBe(false);
    expect(validateChange({ ...validChange(), projectId: 'gone' }, projects).ok).toBe(false);
  });
});
