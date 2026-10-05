(function (global) {
  'use strict';
  const TF = (global.TaskFlow = global.TaskFlow || {});
/* tasks.js - pure task operations (no DOM, no storage). Every function returns new data. */

function generateId() {
  if (globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  return `t-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function createTask(tasks, values, now = new Date()) {
  const stamp = now.toISOString();
  const task = { id: generateId(), ...values, createdAt: stamp, updatedAt: stamp };
  return { tasks: [task, ...tasks], task };
}

/** Returns { tasks, task } or null when the id does not exist. */
function updateTask(tasks, id, values, now = new Date()) {
  const existing = tasks.find((t) => t.id === id);
  if (!existing) return null;
  const task = { ...existing, ...values, id: existing.id, createdAt: existing.createdAt, updatedAt: now.toISOString() };
  return { tasks: tasks.map((t) => (t.id === id ? task : t)), task };
}

function setStatus(tasks, id, status, now = new Date()) {
  return updateTask(tasks, id, { status }, now);
}

/** Returns { tasks, task } (task = the removed one) or null when the id does not exist. */
function deleteTask(tasks, id) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return null;
  return { tasks: tasks.filter((t) => t.id !== id), task };
}

/** Local calendar date as YYYY-MM-DD (due dates are date-only, so compare as strings). */
function todayString(now = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}`;
}

/** Overdue is derived: due date is before today and the task is not completed. */
function isOverdue(task, now = new Date()) {
  return Boolean(task.dueDate) && task.status !== 'Completed' && task.dueDate < todayString(now);
}

function getStats(tasks, now = new Date()) {
  return {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === 'Pending').length,
    inProgress: tasks.filter((t) => t.status === 'In Progress').length,
    completed: tasks.filter((t) => t.status === 'Completed').length,
    overdue: tasks.filter((t) => isOverdue(t, now)).length,
  };
}

const PRIORITY_RANK = { High: 0, Medium: 1, Low: 2 };

const SORT_OPTIONS = {
  newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
  oldest: (a, b) => a.createdAt.localeCompare(b.createdAt),
  priority: (a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority],
  dueDate: (a, b) => {
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1; // tasks without a date go last
    if (!b.dueDate) return -1;
    return a.dueDate.localeCompare(b.dueDate);
  },
  title: (a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }),
};

/** Apply search, filters and sort. filters: { status, category, priority }, each 'all' or a value. */
function getVisibleTasks(tasks, { searchQuery = '', filters = {}, sortOption = 'newest' } = {}, now = new Date()) {
  const q = searchQuery.trim().toLowerCase();
  const { status = 'all', category = 'all', priority = 'all' } = filters;
  const sorter = SORT_OPTIONS[sortOption] || SORT_OPTIONS.newest;
  return tasks
    .filter((t) => {
      if (q && !`${t.title} ${t.description}`.toLowerCase().includes(q)) return false;
      if (status === 'Overdue') { if (!isOverdue(t, now)) return false; }
      else if (status !== 'all' && t.status !== status) return false;
      if (category !== 'all' && t.category !== category) return false;
      if (priority !== 'all' && t.priority !== priority) return false;
      return true;
    })
    .sort(sorter); // Array.prototype.sort is stable: ties keep stored order
}

  TF.Tasks = { generateId, createTask, updateTask, setStatus, deleteTask, todayString, isOverdue, getStats, SORT_OPTIONS, getVisibleTasks };
})(typeof window !== 'undefined' ? window : globalThis);
