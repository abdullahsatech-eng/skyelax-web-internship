(function (global) {
  'use strict';
  const TF = (global.TaskFlow = global.TaskFlow || {});
/* validation.js - allowed values, form validation and stored-record validation. */

const CATEGORIES = ['Work', 'Personal', 'Study', 'Development'];
const PRIORITIES = ['Low', 'Medium', 'High'];
const STATUSES = ['Pending', 'In Progress', 'Completed'];
const LIMITS = { title: 100, description: 500 };

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/** True for a real calendar date written as YYYY-MM-DD (rejects 2025-02-30). */
function isValidDateString(value) {
  if (typeof value !== 'string') return false;
  const m = DATE_PATTERN.exec(value);
  if (!m) return false;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(Date.UTC(y, mo - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === mo - 1 && date.getUTCDate() === d;
}

/**
 * Validate raw form input. Never throws and never truncates input.
 * Returns { valid, errors: {field: message}, values: normalized }.
 */
function validateTaskInput(input) {
  const raw = input && typeof input === 'object' ? input : {};
  const str = (v) => (typeof v === 'string' ? v.trim() : '');
  const values = {
    title: str(raw.title),
    description: str(raw.description),
    category: str(raw.category),
    priority: str(raw.priority),
    status: str(raw.status),
    dueDate: str(raw.dueDate) || null,
  };
  const errors = {};

  if (!values.title) errors.title = 'Title is required.';
  else if (values.title.length > LIMITS.title) {
    errors.title = `Title is ${values.title.length} characters. Shorten it to ${LIMITS.title} or fewer.`;
  }
  if (values.description.length > LIMITS.description) {
    errors.description = `Description is ${values.description.length} characters. Shorten it to ${LIMITS.description} or fewer.`;
  }
  if (!CATEGORIES.includes(values.category)) errors.category = 'Select a valid category.';
  if (!PRIORITIES.includes(values.priority)) errors.priority = 'Select a valid priority.';
  if (!STATUSES.includes(values.status)) errors.status = 'Select a valid status.';
  if (values.dueDate !== null && !isValidDateString(values.dueDate)) {
    errors.dueDate = 'Select a valid date.';
  }
  return { valid: Object.keys(errors).length === 0, errors, values };
}

const isIso = (v) => typeof v === 'string' && v !== '' && !Number.isNaN(Date.parse(v));

/** Validate one record read from storage. Returns a clean task or null. */
function validateStoredTask(record) {
  if (!record || typeof record !== 'object' || Array.isArray(record)) return null;
  if (typeof record.id !== 'string' || record.id.trim() === '') return null;
  const result = validateTaskInput({
    title: record.title,
    description: record.description ?? '',
    category: record.category,
    priority: record.priority,
    status: record.status,
    dueDate: record.dueDate ?? '',
  });
  if (!result.valid) return null;
  const now = new Date().toISOString();
  return {
    id: record.id,
    ...result.values,
    createdAt: isIso(record.createdAt) ? record.createdAt : now,
    updatedAt: isIso(record.updatedAt) ? record.updatedAt : now,
  };
}

  TF.Validation = { CATEGORIES, PRIORITIES, STATUSES, LIMITS, isValidDateString, validateTaskInput, validateStoredTask };
})(typeof window !== 'undefined' ? window : globalThis);
