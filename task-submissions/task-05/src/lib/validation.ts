import type { ChangeRequest, CurrencyCode, Project, ProjectStatus, ScopeItem } from '../types';
import { CURRENCIES, PROJECT_STATUSES } from '../types';
import { isIsoDate } from './dates';
import { parseMoney, parseWholeNumber } from './money';

/** Validation rules. Errors are keyed by the DOM id of the field, so the form can focus the right control. */

export type FieldErrors = Record<string, string>;
export type ValidationResult<T> = { ok: true; value: T } | { ok: false; errors: FieldErrors };

export const LIMITS = {
  nameLength: 80,
  descriptionLength: 500,
  scopeDescriptionLength: 300,
  changeTitleLength: 100,
  changeDescriptionLength: 1000,
  maxMoney: 1_000_000_000,
  maxScheduleDays: 730,
  minDate: '2000-01-01',
  maxDate: '2100-12-31',
} as const;

export const PROJECT_FIELD = {
  name: 'project-name',
  client: 'project-client',
  description: 'project-description',
  currency: 'project-currency',
  budget: 'project-budget',
  endDate: 'project-end-date',
  status: 'project-status',
} as const;

export const CHANGE_FIELD = {
  project: 'change-project',
  title: 'change-title',
  description: 'change-description',
  cost: 'change-cost',
  days: 'change-days',
} as const;

export const scopeFieldId = (scopeItemId: string, part: 'title' | 'description') => `scope-${scopeItemId}-${part}`;

export interface ProjectDraft {
  name: string;
  clientName: string;
  description: string;
  currency: string;
  budget: string;
  endDate: string;
  status: string;
  scopeItems: ScopeItem[];
}

export type ProjectInput = Omit<Project, 'id' | 'createdAt'>;

export interface ChangeDraft {
  projectId: string;
  title: string;
  description: string;
  cost: string;
  days: string;
}

export type ChangeInput = Pick<
  ChangeRequest,
  'projectId' | 'title' | 'description' | 'costAdjustment' | 'scheduleImpactDays'
>;

const MONEY_HELP = 'Use digits only, with at most two decimal places, for example 1500 or 1,500.50.';

function checkText(errors: FieldErrors, id: string, value: string, label: string, max: number, required: boolean) {
  const text = value.trim();
  if (required && text.length === 0) errors[id] = `Enter ${label}.`;
  else if (text.length > max) errors[id] = `Use ${max} characters or fewer. This has ${text.length}.`;
}

/** Parses the cost field. Returns the number, or an error message. */
export function checkCostText(text: string): { value: number } | { error: string } {
  if (text.trim() === '') {
    return { error: 'Enter the proposed additional cost. Use 0 if the change only affects the schedule.' };
  }
  if (text.trim().startsWith('-')) {
    return { error: 'Negative adjustments are not supported. Enter a cost of 0 or more.' };
  }
  const value = parseMoney(text);
  if (value === null) return { error: `That is not a valid amount. ${MONEY_HELP}` };
  if (value > LIMITS.maxMoney) return { error: 'Enter an amount of 1,000,000,000 or less.' };
  return { value };
}

/** Parses the schedule-days field. Returns the number, or an error message. */
export function checkDaysText(text: string): { value: number } | { error: string } {
  if (text.trim() === '') {
    return { error: 'Enter the schedule extension in days. Use 0 if the deadline does not move.' };
  }
  if (text.trim().startsWith('-')) {
    return { error: 'The deadline cannot move earlier. Enter 0 or more days.' };
  }
  const value = parseWholeNumber(text);
  if (value === null) return { error: 'Enter a whole number of days, for example 5.' };
  if (value > LIMITS.maxScheduleDays) return { error: `Enter ${LIMITS.maxScheduleDays} days or fewer.` };
  return { value };
}

export function validateProject(draft: ProjectDraft): ValidationResult<ProjectInput> {
  const errors: FieldErrors = {};

  checkText(errors, PROJECT_FIELD.name, draft.name, 'a project name', LIMITS.nameLength, true);
  checkText(errors, PROJECT_FIELD.client, draft.clientName, 'the client name', LIMITS.nameLength, true);
  checkText(errors, PROJECT_FIELD.description, draft.description, 'a short project description', LIMITS.descriptionLength, true);

  if (!(CURRENCIES as readonly string[]).includes(draft.currency)) {
    errors[PROJECT_FIELD.currency] = 'Choose a currency from the list.';
  }

  let budget = 0;
  if (draft.budget.trim() === '') {
    errors[PROJECT_FIELD.budget] = 'Enter the original agreed budget.';
  } else {
    const parsed = parseMoney(draft.budget);
    if (parsed === null) {
      errors[PROJECT_FIELD.budget] = draft.budget.trim().startsWith('-')
        ? 'The budget cannot be negative. Enter an amount above zero.'
        : `That is not a valid amount. ${MONEY_HELP}`;
    } else if (parsed <= 0) {
      errors[PROJECT_FIELD.budget] = 'The original budget must be greater than zero.';
    } else if (parsed > LIMITS.maxMoney) {
      errors[PROJECT_FIELD.budget] = 'Enter a budget of 1,000,000,000 or less.';
    } else {
      budget = parsed;
    }
  }

  if (draft.endDate === '') {
    errors[PROJECT_FIELD.endDate] = 'Choose the original target completion date.';
  } else if (!isIsoDate(draft.endDate)) {
    errors[PROJECT_FIELD.endDate] = 'Enter a valid date.';
  } else if (draft.endDate < LIMITS.minDate || draft.endDate > LIMITS.maxDate) {
    errors[PROJECT_FIELD.endDate] = 'Choose a date between the years 2000 and 2100.';
  }

  if (!(PROJECT_STATUSES as readonly string[]).includes(draft.status)) {
    errors[PROJECT_FIELD.status] = 'Choose a status from the list.';
  }

  draft.scopeItems.forEach((item, index) => {
    const position = index + 1;
    const titleId = scopeFieldId(item.id, 'title');
    if (item.title.trim() === '') errors[titleId] = `Enter a title for scope item ${position}, or remove the item.`;
    else if (item.title.trim().length > LIMITS.nameLength) {
      errors[titleId] = `Use ${LIMITS.nameLength} characters or fewer for the title of scope item ${position}.`;
    }
    if (item.description.trim().length > LIMITS.scopeDescriptionLength) {
      errors[scopeFieldId(item.id, 'description')] =
        `Use ${LIMITS.scopeDescriptionLength} characters or fewer for the description of scope item ${position}.`;
    }
  });

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    value: {
      name: draft.name.trim(),
      clientName: draft.clientName.trim(),
      description: draft.description.trim(),
      currency: draft.currency as CurrencyCode,
      originalBudget: budget,
      originalEndDate: draft.endDate,
      status: draft.status as ProjectStatus,
      scopeItems: draft.scopeItems.map((item) => ({
        id: item.id,
        title: item.title.trim(),
        description: item.description.trim(),
      })),
    },
  };
}

export function validateChange(draft: ChangeDraft, projects: Project[]): ValidationResult<ChangeInput> {
  const errors: FieldErrors = {};

  if (draft.projectId === '') errors[CHANGE_FIELD.project] = 'Choose the project this change belongs to.';
  else if (!projects.some((project) => project.id === draft.projectId)) {
    errors[CHANGE_FIELD.project] = 'The selected project no longer exists. Choose another project.';
  }

  checkText(errors, CHANGE_FIELD.title, draft.title, 'a title for the change', LIMITS.changeTitleLength, true);
  checkText(errors, CHANGE_FIELD.description, draft.description, 'a description of the change', LIMITS.changeDescriptionLength, true);

  const cost = checkCostText(draft.cost);
  if ('error' in cost) errors[CHANGE_FIELD.cost] = cost.error;
  const days = checkDaysText(draft.days);
  if ('error' in days) errors[CHANGE_FIELD.days] = days.error;

  if ('value' in cost && 'value' in days && cost.value === 0 && days.value === 0) {
    errors[CHANGE_FIELD.cost] =
      'A change needs a cost, a schedule extension, or both. Enter a value above zero in the cost or the days field.';
  }

  if (Object.keys(errors).length > 0 || !('value' in cost) || !('value' in days)) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      projectId: draft.projectId,
      title: draft.title.trim(),
      description: draft.description.trim(),
      costAdjustment: cost.value,
      scheduleImpactDays: days.value,
    },
  };
}
