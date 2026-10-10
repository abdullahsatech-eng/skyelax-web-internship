import type { ChangeRequest, ChangeStatus, CurrencyCode, Project } from '../types';
import { CURRENCIES } from '../types';
import { addDaysIso } from './dates';
import { fromCents, toCents } from './money';

/*
 * Calculation rules (documented in README):
 *  1. Only APPROVED (demo) and PENDING REVIEW changes feed into revised figures. Drafts and rejected
 *     changes never do. Approved and pending amounts are always reported separately.
 *  2. Revised budget = original budget + sum of included cost adjustments (summed in cents).
 *  3. Schedule extensions are added together (a simple "worst case, sequential" assumption), then added
 *     to the original completion date in UTC. If the date cannot be calculated the result is null.
 *  4. Currencies are never mixed: totals are grouped per currency and no conversion is performed.
 */

export type ImpactKind = 'approved' | 'proposed';

export interface ImpactAddition {
  label: string;
  kind: ImpactKind;
  cost: number;
  days: number;
}

export interface Agreement {
  currency: CurrencyCode;
  originalBudget: number;
  originalEndDate: string;
}

export interface ImpactSummary {
  currency: CurrencyCode;
  originalBudget: number;
  additions: ImpactAddition[];
  addedCost: number;
  revisedBudget: number;
  /** Added cost as a percentage of the original budget, rounded to one decimal place. */
  percentIncrease: number;
  originalEndDate: string;
  addedDays: number;
  revisedEndDate: string | null;
}

export function buildImpactSummary(agreement: Agreement, additions: ImpactAddition[]): ImpactSummary {
  let addedCents = 0;
  let addedDays = 0;
  for (const addition of additions) {
    addedCents += toCents(addition.cost);
    addedDays += addition.days;
  }
  const originalCents = toCents(agreement.originalBudget);
  const percent = originalCents > 0 ? (addedCents / originalCents) * 100 : 0;
  return {
    currency: agreement.currency,
    originalBudget: agreement.originalBudget,
    additions,
    addedCost: fromCents(addedCents),
    revisedBudget: fromCents(originalCents + addedCents),
    percentIncrease: Math.round(percent * 10) / 10,
    originalEndDate: agreement.originalEndDate,
    addedDays,
    revisedEndDate: addDaysIso(agreement.originalEndDate, addedDays),
  };
}

export function groupChangesByProject(changes: ChangeRequest[]): Map<string, ChangeRequest[]> {
  const groups = new Map<string, ChangeRequest[]>();
  for (const change of changes) {
    const list = groups.get(change.projectId);
    if (list) list.push(change);
    else groups.set(change.projectId, [change]);
  }
  return groups;
}

export interface ProjectChangeSummary {
  counts: Record<ChangeStatus, number>;
  approvedCost: number;
  pendingCost: number;
  impact: ImpactSummary;
}

/** Single pass over one project's changes. */
export function summarizeProjectChanges(project: Project, changes: ChangeRequest[]): ProjectChangeSummary {
  const counts: Record<ChangeStatus, number> = { draft: 0, pending_review: 0, approved: 0, rejected: 0 };
  let approvedCents = 0;
  let pendingCents = 0;
  let approvedDays = 0;
  let pendingDays = 0;

  for (const change of changes) {
    counts[change.status] += 1;
    if (change.status === 'approved') {
      approvedCents += toCents(change.costAdjustment);
      approvedDays += change.scheduleImpactDays;
    } else if (change.status === 'pending_review') {
      pendingCents += toCents(change.costAdjustment);
      pendingDays += change.scheduleImpactDays;
    }
  }

  const additions: ImpactAddition[] = [];
  if (counts.approved > 0) {
    additions.push({ label: 'Approved changes (demo)', kind: 'approved', cost: fromCents(approvedCents), days: approvedDays });
  }
  if (counts.pending_review > 0) {
    additions.push({ label: 'Awaiting review (proposed)', kind: 'proposed', cost: fromCents(pendingCents), days: pendingDays });
  }

  return {
    counts,
    approvedCost: fromCents(approvedCents),
    pendingCost: fromCents(pendingCents),
    impact: buildImpactSummary(project, additions),
  };
}

export interface CurrencyTotals {
  currency: CurrencyCode;
  originalBudget: number;
  approvedCost: number;
  pendingCost: number;
}

/** Totals per currency, in a stable currency order. Only currencies that have projects are returned. */
export function totalsByCurrency(projects: Project[], changes: ChangeRequest[]): CurrencyTotals[] {
  const projectsById = new Map(projects.map((project) => [project.id, project]));
  const buckets = new Map<CurrencyCode, { original: number; approved: number; pending: number }>();

  for (const project of projects) {
    const bucket = buckets.get(project.currency) ?? { original: 0, approved: 0, pending: 0 };
    bucket.original += toCents(project.originalBudget);
    buckets.set(project.currency, bucket);
  }
  for (const change of changes) {
    const project = projectsById.get(change.projectId);
    if (!project) continue;
    const bucket = buckets.get(project.currency);
    if (!bucket) continue;
    if (change.status === 'approved') bucket.approved += toCents(change.costAdjustment);
    else if (change.status === 'pending_review') bucket.pending += toCents(change.costAdjustment);
  }

  return CURRENCIES.filter((currency) => buckets.has(currency)).map((currency) => {
    const bucket = buckets.get(currency)!;
    return {
      currency,
      originalBudget: fromCents(bucket.original),
      approvedCost: fromCents(bucket.approved),
      pendingCost: fromCents(bucket.pending),
    };
  });
}

export interface DashboardMetrics {
  totalProjects: number;
  activeProjects: number;
  pendingRequests: number;
  draftRequests: number;
  totals: CurrencyTotals[];
}

export function computeDashboardMetrics(projects: Project[], changes: ChangeRequest[]): DashboardMetrics {
  let activeProjects = 0;
  for (const project of projects) if (project.status === 'active') activeProjects += 1;
  let pendingRequests = 0;
  let draftRequests = 0;
  for (const change of changes) {
    if (change.status === 'pending_review') pendingRequests += 1;
    else if (change.status === 'draft') draftRequests += 1;
  }
  return {
    totalProjects: projects.length,
    activeProjects,
    pendingRequests,
    draftRequests,
    totals: totalsByCurrency(projects, changes),
  };
}
