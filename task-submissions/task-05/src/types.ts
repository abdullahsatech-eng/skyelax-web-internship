/** Core domain types for ScopeBridge. Everything the UI shows is derived from these. */

export const CURRENCIES = ['USD', 'EUR', 'GBP', 'PKR'] as const;
export type CurrencyCode = (typeof CURRENCIES)[number];

export const PROJECT_STATUSES = ['planning', 'active', 'on_hold', 'completed'] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const CHANGE_STATUSES = ['draft', 'pending_review', 'approved', 'rejected'] as const;
export type ChangeStatus = (typeof CHANGE_STATUSES)[number];

/** One deliverable in the original agreement. Owned by exactly one project. */
export interface ScopeItem {
  id: string;
  title: string;
  description: string;
}

/** The original agreement. Change requests never modify these fields. */
export interface Project {
  id: string;
  name: string;
  clientName: string;
  description: string;
  currency: CurrencyCode;
  originalBudget: number;
  /** ISO calendar date: YYYY-MM-DD */
  originalEndDate: string;
  status: ProjectStatus;
  scopeItems: ScopeItem[];
  /** ISO timestamp */
  createdAt: string;
}

/** A proposed (not agreed) change to a project. Amounts use the project's currency. */
export interface ChangeRequest {
  id: string;
  projectId: string;
  title: string;
  description: string;
  /** Proposed additional cost, >= 0. */
  costAdjustment: number;
  /** Proposed schedule extension in whole days, >= 0. */
  scheduleImpactDays: number;
  status: ChangeStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AppData {
  projects: Project[];
  changeRequests: ChangeRequest[];
}
