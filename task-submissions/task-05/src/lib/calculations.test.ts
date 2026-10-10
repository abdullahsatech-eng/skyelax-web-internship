import { describe, expect, it } from 'vitest';
import { makeChange, makeProject } from '../test/factories';
import {
  buildImpactSummary,
  computeDashboardMetrics,
  groupChangesByProject,
  summarizeProjectChanges,
  totalsByCurrency,
} from './calculations';

describe('buildImpactSummary', () => {
  const agreement = { currency: 'USD' as const, originalBudget: 10000, originalEndDate: '2026-12-01' };

  it('adds cost and days to the original agreement', () => {
    const summary = buildImpactSummary(agreement, [{ label: 'x', kind: 'proposed', cost: 2500, days: 10 }]);
    expect(summary.revisedBudget).toBe(12500);
    expect(summary.addedCost).toBe(2500);
    expect(summary.percentIncrease).toBe(25);
    expect(summary.revisedEndDate).toBe('2026-12-11');
  });

  it('does not change anything when there are no additions', () => {
    const summary = buildImpactSummary(agreement, []);
    expect(summary.revisedBudget).toBe(10000);
    expect(summary.revisedEndDate).toBe('2026-12-01');
    expect(summary.percentIncrease).toBe(0);
  });

  it('avoids floating-point drift when adding cents', () => {
    const summary = buildImpactSummary({ ...agreement, originalBudget: 0.1 }, [
      { label: 'x', kind: 'proposed', cost: 0.2, days: 0 },
    ]);
    expect(summary.revisedBudget).toBe(0.3);
  });

  it('rolls over months, years and leap days', () => {
    expect(buildImpactSummary({ ...agreement, originalEndDate: '2026-12-28' }, [{ label: 'x', kind: 'proposed', cost: 0, days: 10 }]).revisedEndDate).toBe('2027-01-07');
    expect(buildImpactSummary({ ...agreement, originalEndDate: '2028-02-27' }, [{ label: 'x', kind: 'proposed', cost: 0, days: 2 }]).revisedEndDate).toBe('2028-02-29');
  });

  it('returns a null date instead of a wrong one when the original date is invalid', () => {
    const summary = buildImpactSummary({ ...agreement, originalEndDate: 'not-a-date' }, [{ label: 'x', kind: 'proposed', cost: 1, days: 1 }]);
    expect(summary.revisedEndDate).toBeNull();
  });

  it('never produces NaN when the original budget is zero', () => {
    const summary = buildImpactSummary({ ...agreement, originalBudget: 0 }, [{ label: 'x', kind: 'proposed', cost: 100, days: 1 }]);
    expect(summary.percentIncrease).toBe(0);
    expect(Number.isNaN(summary.revisedBudget)).toBe(false);
  });
});

describe('summarizeProjectChanges', () => {
  const project = makeProject();

  it('keeps approved and proposed amounts separate and ignores drafts and rejected changes', () => {
    const summary = summarizeProjectChanges(project, [
      makeChange({ id: 'a', status: 'approved', costAdjustment: 1000, scheduleImpactDays: 4 }),
      makeChange({ id: 'b', status: 'pending_review', costAdjustment: 2000, scheduleImpactDays: 6 }),
      makeChange({ id: 'c', status: 'draft', costAdjustment: 9999, scheduleImpactDays: 99 }),
      makeChange({ id: 'd', status: 'rejected', costAdjustment: 8888, scheduleImpactDays: 88 }),
    ]);
    expect(summary.approvedCost).toBe(1000);
    expect(summary.pendingCost).toBe(2000);
    expect(summary.counts).toEqual({ draft: 1, pending_review: 1, approved: 1, rejected: 1 });
    expect(summary.impact.revisedBudget).toBe(13000);
    expect(summary.impact.addedDays).toBe(10);
    expect(summary.impact.revisedEndDate).toBe('2026-12-11');
  });

  it('handles a project with no change requests', () => {
    const summary = summarizeProjectChanges(project, []);
    expect(summary.impact.additions).toHaveLength(0);
    expect(summary.impact.revisedBudget).toBe(project.originalBudget);
  });
});

describe('totalsByCurrency and dashboard metrics', () => {
  const projects = [
    makeProject({ id: 'p1', currency: 'USD', originalBudget: 1000, status: 'active' }),
    makeProject({ id: 'p2', currency: 'EUR', originalBudget: 2000, status: 'planning' }),
    makeProject({ id: 'p3', currency: 'USD', originalBudget: 500, status: 'completed' }),
  ];
  const changes = [
    makeChange({ id: 'c1', projectId: 'p1', status: 'pending_review', costAdjustment: 100 }),
    makeChange({ id: 'c2', projectId: 'p3', status: 'pending_review', costAdjustment: 50.5 }),
    makeChange({ id: 'c3', projectId: 'p2', status: 'approved', costAdjustment: 300 }),
    makeChange({ id: 'c4', projectId: 'p1', status: 'draft', costAdjustment: 700 }),
    makeChange({ id: 'c5', projectId: 'missing', status: 'pending_review', costAdjustment: 999 }),
  ];

  it('never mixes currencies', () => {
    const totals = totalsByCurrency(projects, changes);
    expect(totals).toEqual([
      { currency: 'USD', originalBudget: 1500, approvedCost: 0, pendingCost: 150.5 },
      { currency: 'EUR', originalBudget: 2000, approvedCost: 300, pendingCost: 0 },
    ]);
  });

  it('derives dashboard figures from the records', () => {
    const metrics = computeDashboardMetrics(projects, changes);
    expect(metrics.totalProjects).toBe(3);
    expect(metrics.activeProjects).toBe(1);
    expect(metrics.pendingRequests).toBe(3);
    expect(metrics.draftRequests).toBe(1);
  });

  it('reports zeros and no currency rows when there is no data', () => {
    const metrics = computeDashboardMetrics([], []);
    expect(metrics.totalProjects).toBe(0);
    expect(metrics.totals).toEqual([]);
  });

  it('groups changes by project in one pass', () => {
    const groups = groupChangesByProject(changes);
    expect(groups.get('p1')).toHaveLength(2);
    expect(groups.get('p2')).toHaveLength(1);
    expect(groups.get('nope')).toBeUndefined();
  });
});
