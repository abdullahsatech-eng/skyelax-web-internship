import { createDemoData } from '../data/demoData';
import type { AppData, ChangeRequest, Project, ScopeItem } from '../types';
import { CHANGE_STATUSES, CURRENCIES, PROJECT_STATUSES } from '../types';
import { isIsoDate } from './dates';

/** Data is kept in this browser only (localStorage). It is never sent anywhere. */
export const STORAGE_KEY = 'scopebridge.task05.v1';

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const isText = (value: unknown): value is string => typeof value === 'string';
const isNonNegativeNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0;
const isOneOf = <T extends string>(list: readonly T[], value: unknown): value is T =>
  typeof value === 'string' && (list as readonly string[]).includes(value);

function isScopeItem(value: unknown): value is ScopeItem {
  return isRecord(value) && isText(value.id) && value.id !== '' && isText(value.title) && isText(value.description);
}

export function isProject(value: unknown): value is Project {
  return (
    isRecord(value) &&
    isText(value.id) && value.id !== '' &&
    isText(value.name) &&
    isText(value.clientName) &&
    isText(value.description) &&
    isOneOf(CURRENCIES, value.currency) &&
    isNonNegativeNumber(value.originalBudget) &&
    isText(value.originalEndDate) && isIsoDate(value.originalEndDate) &&
    isOneOf(PROJECT_STATUSES, value.status) &&
    Array.isArray(value.scopeItems) && value.scopeItems.every(isScopeItem) &&
    isText(value.createdAt)
  );
}

export function isChangeRequest(value: unknown): value is ChangeRequest {
  return (
    isRecord(value) &&
    isText(value.id) && value.id !== '' &&
    isText(value.projectId) &&
    isText(value.title) &&
    isText(value.description) &&
    isNonNegativeNumber(value.costAdjustment) &&
    typeof value.scheduleImpactDays === 'number' && Number.isInteger(value.scheduleImpactDays) && value.scheduleImpactDays >= 0 &&
    isOneOf(CHANGE_STATUSES, value.status) &&
    isText(value.createdAt) &&
    isText(value.updatedAt)
  );
}

/**
 * Validates untrusted stored data. Invalid records are dropped, and change requests that point to a
 * missing project are removed, so the app never starts from inconsistent relationships.
 * Returns null when the payload is not usable at all.
 */
export function parseStoredData(raw: string | null): AppData | null {
  if (raw === null) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!isRecord(parsed) || !Array.isArray(parsed.projects) || !Array.isArray(parsed.changeRequests)) return null;

  const projects = parsed.projects.filter(isProject);
  const projectIds = new Set(projects.map((project) => project.id));
  const changeRequests = parsed.changeRequests.filter(
    (change): change is ChangeRequest => isChangeRequest(change) && projectIds.has(change.projectId),
  );
  return { projects, changeRequests };
}

function defaultStorage(): StorageLike | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null; // Storage can throw when blocked by browser privacy settings.
  }
}

/** Loads saved data, or the demo data when nothing usable is saved. Never throws. */
export function loadAppData(storage: StorageLike | null = defaultStorage()): AppData {
  if (!storage) return createDemoData();
  try {
    return parseStoredData(storage.getItem(STORAGE_KEY)) ?? createDemoData();
  } catch {
    return createDemoData();
  }
}

/** Returns false when the data could not be saved (for example, storage is full or blocked). */
export function saveAppData(data: AppData, storage: StorageLike | null = defaultStorage()): boolean {
  if (!storage) return false;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}
