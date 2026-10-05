(function (global) {
  'use strict';
  const TF = (global.TaskFlow = global.TaskFlow || {});
  const { validateStoredTask } = TF.Validation;
/* storage.js - localStorage wrapper: versioned schema, validation, safe recovery. */

const STORAGE_KEY = 'taskflow.tasks';
const BACKUP_KEY = 'taskflow.tasks.backup'; // raw copy of unreadable/partly invalid data
const SCHEMA_VERSION = 1;
const RECOVERY = 'Stored task data was invalid, so TaskFlow safely recovered.';

function getStore() {
  try {
    return globalThis.localStorage || null; // accessing it can throw in some privacy modes
  } catch {
    return null;
  }
}

function backup(store, raw) {
  try { store.setItem(BACKUP_KEY, raw); } catch { /* best effort */ }
}

/**
 * Load tasks. Never throws.
 * Returns { tasks, status: 'empty'|'ok'|'recovered'|'unavailable', dropped, message }.
 */
function loadTasks(store = getStore()) {
  if (!store) {
    return { tasks: [], status: 'unavailable', dropped: 0, message: 'Browser storage is unavailable, so tasks will not be saved after you close this page.' };
  }
  let raw;
  try {
    raw = store.getItem(STORAGE_KEY);
  } catch {
    return { tasks: [], status: 'unavailable', dropped: 0, message: 'Saved tasks could not be read from browser storage.' };
  }
  if (raw === null) return { tasks: [], status: 'empty', dropped: 0, message: '' };

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    backup(store, raw);
    return { tasks: [], status: 'recovered', dropped: 0, message: RECOVERY + ' Unreadable data was not loaded; TaskFlow started with an empty list.' };
  }

  // Accept { version, tasks: [...] } and, leniently, a bare array.
  const list = Array.isArray(parsed) ? parsed : parsed && Array.isArray(parsed.tasks) ? parsed.tasks : null;
  if (!list) {
    backup(store, raw);
    return { tasks: [], status: 'recovered', dropped: 0, message: RECOVERY + ' The data had an unexpected format; TaskFlow started with an empty list.' };
  }

  const seen = new Set();
  const tasks = [];
  for (const record of list) {
    const task = validateStoredTask(record);
    if (task && !seen.has(task.id)) {
      seen.add(task.id);
      tasks.push(task);
    }
  }
  const dropped = list.length - tasks.length;
  if (dropped > 0) {
    backup(store, raw);
    return {
      tasks, status: 'recovered', dropped,
      message: `${RECOVERY} ${dropped} saved ${dropped === 1 ? 'task was' : 'tasks were'} invalid and skipped. ${tasks.length} valid ${tasks.length === 1 ? 'task was' : 'tasks were'} kept.`,
    };
  }
  return { tasks, status: 'ok', dropped: 0, message: '' };
}

/** Save tasks. Returns { ok, error }. Never throws. */
function saveTasks(tasks, store = getStore()) {
  if (!store) return { ok: false, error: 'Browser storage is unavailable.' };
  try {
    store.setItem(STORAGE_KEY, JSON.stringify({ version: SCHEMA_VERSION, tasks }));
    return { ok: true, error: '' };
  } catch (err) {
    const full = err && (err.name === 'QuotaExceededError' || err.code === 22);
    return { ok: false, error: full ? 'Browser storage is full.' : 'Browser storage rejected the save.' };
  }
}

/** Remove all saved task data (including the recovery backup). */
function resetStorage(store = getStore()) {
  if (!store) return { ok: false, error: 'Browser storage is unavailable.' };
  try {
    store.removeItem(STORAGE_KEY);
    store.removeItem(BACKUP_KEY);
    return { ok: true, error: '' };
  } catch {
    return { ok: false, error: 'Browser storage rejected the reset.' };
  }
}

  TF.Storage = { STORAGE_KEY, BACKUP_KEY, SCHEMA_VERSION, loadTasks, saveTasks, resetStorage };
})(typeof window !== 'undefined' ? window : globalThis);
