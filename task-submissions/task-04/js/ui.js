(function (global) {
  'use strict';
  const TF = (global.TaskFlow = global.TaskFlow || {});
  const { STATUSES } = TF.Validation;
  const { getStats, isOverdue } = TF.Tasks;
/* ui.js - all DOM rendering. User content is always inserted with textContent. */

const $ = (id) => document.getElementById(id);
const FIELDS = ['title', 'description', 'category', 'priority', 'status', 'dueDate'];

// Inline SVG icons (24x24, stroke = currentColor). Decorative: the text label always carries the meaning.
const SVG_NS = 'http://www.w3.org/2000/svg';
const ICONS = {
  'Pending': [['circle', { cx: 12, cy: 12, r: 9 }], ['path', { d: 'M12 7v5l3 2' }]],
  'In Progress': [['circle', { cx: 12, cy: 12, r: 9 }], ['path', { d: 'M12 3a9 9 0 0 1 0 18z', fill: 'currentColor' }]],
  'Completed': [['circle', { cx: 12, cy: 12, r: 9 }], ['path', { d: 'M8 12.5l2.7 2.7L16 9.5' }]],
  'Low': [['path', { d: 'M12 5v14M6 13l6 6 6-6' }]],
  'Medium': [['path', { d: 'M5 9h14M5 15h14' }]],
  'High': [['path', { d: 'M12 19V5M6 11l6-6 6 6' }]],
  'Work': [['rect', { x: 3, y: 7, width: 18, height: 13, rx: 2 }], ['path', { d: 'M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18' }]],
  'Personal': [['circle', { cx: 12, cy: 8, r: 4 }], ['path', { d: 'M4 21a8 8 0 0 1 16 0' }]],
  'Study': [['path', { d: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z' }], ['path', { d: 'M4 19.5V21h16v-2' }]],
  'Development': [['path', { d: 'M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16' }]],
};

function icon(name) {
  const svg = document.createElementNS(SVG_NS, 'svg');
  for (const [k, v] of Object.entries({ viewBox: '0 0 24 24', class: 'icon', 'aria-hidden': 'true', focusable: 'false' })) svg.setAttribute(k, v);
  for (const [tag, attrs] of ICONS[name] || []) {
    const shape = document.createElementNS(SVG_NS, tag);
    for (const [k, v] of Object.entries(attrs)) shape.setAttribute(k, v);
    svg.append(shape);
  }
  return svg;
}

/** Badge = decorative icon + visible text. `hiddenPrefix` adds screen-reader-only context. */
function badge(className, iconName, text, hiddenPrefix) {
  const b = el('span', className);
  b.append(icon(iconName));
  const label = el('span', 'badge-label'); // prefix + text stay in one text run (correct reading order)
  if (hiddenPrefix) label.append(el('span', 'visually-hidden', hiddenPrefix));
  label.append(document.createTextNode(text));
  b.append(label);
  return b;
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function fillSelect(select, options, firstLabel) {
  select.replaceChildren();
  if (firstLabel) select.append(new Option(firstLabel, 'all'));
  for (const o of options) select.append(new Option(o, o));
}

function initControls() {
  setFormValues(); // dropdown options are static in index.html so they exist even if this script fails
}

/* ---------- form ---------- */

function getFormValues() {
  return Object.fromEntries(FIELDS.map((f) => [f, $(f).value]));
}

function setFormValues(task) {
  const v = task || { title: '', description: '', category: '', priority: '', status: 'Pending', dueDate: '' };
  for (const f of FIELDS) $(f).value = v[f] ?? '';
  updateCounters();
}

function updateCounters() {
  $('title-count').textContent = `${$('title').value.length}/100`;
  $('description-count').textContent = `${$('description').value.length}/500`;
}

function renderFormMode(editing) {
  $('form-heading').textContent = editing ? 'Edit task' : 'Create task';
  $('mode-badge').textContent = editing ? 'Editing' : 'New';
  $('mode-badge').classList.toggle('is-editing', editing);
  $('form-panel').classList.toggle('is-editing', editing);
  $('submit-btn').textContent = editing ? 'Save Changes' : 'Create Task';
  $('cancel-btn').hidden = !editing;
  $('clear-btn').hidden = false;
}

function showErrors(errors) {
  for (const f of FIELDS) {
    const msg = errors[f] || '';
    $(`${f}-error`).textContent = msg;
    if (msg) $(f).setAttribute('aria-invalid', 'true');
    else $(f).removeAttribute('aria-invalid');
  }
  const first = FIELDS.find((f) => errors[f]);
  if (first) $(first).focus();
}

const clearErrors = () => showErrors({});

/* ---------- feedback ---------- */

let feedbackTimer;
function showFeedback(message, type = 'success') {
  const box = $('feedback');
  clearTimeout(feedbackTimer);
  box.className = `feedback is-visible feedback-${type}`;
  const icon = type === 'error' ? '\u26A0 ' : type === 'warning' ? '\u2139 ' : '\u2713 ';
  box.textContent = icon + message;
  // Errors/warnings stay until the next action; success messages fade out.
  if (type === 'success') feedbackTimer = setTimeout(() => { box.className = 'feedback'; box.textContent = ''; }, 6000);
}

/* ---------- stats ---------- */

function renderStats(tasks) {
  const s = getStats(tasks);
  const items = [['Total', s.total, ''], ['Pending', s.pending, ''], ['In Progress', s.inProgress, ''], ['Completed', s.completed, ''], ['Overdue', s.overdue, s.overdue ? 'is-alert' : '']];
  const dl = $('stats');
  dl.replaceChildren();
  for (const [label, value, cls] of items) {
    const box = el('div', `stat ${cls}`.trim());
    box.append(el('dt', '', label), el('dd', '', String(value)));
    dl.append(box);
  }
}

/* ---------- task list ---------- */

function formatDate(dateString) {
  const [y, m, d] = dateString.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatStamp(iso) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? 'unknown' : d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

function actionButton(label, action, id, extraClass, ariaLabel) {
  const b = el('button', `btn btn-small ${extraClass}`, label);
  b.type = 'button';
  b.dataset.action = action;
  b.dataset.id = id;
  if (ariaLabel) b.setAttribute('aria-label', ariaLabel);
  return b;
}

function buildCard(task, confirmingId) {
  const overdue = isOverdue(task);
  const li = el('li', `task-card status-${task.status.replace(/\s+/g, '-').toLowerCase()}${overdue ? ' is-overdue' : ''}`);
  li.dataset.id = task.id;

  li.append(el('h3', 'task-title', task.title));

  const meta = el('p', 'task-meta');
  meta.append(badge('badge badge-category', task.category, task.category, 'Category: '));
  meta.append(badge(`badge badge-priority priority-${task.priority.toLowerCase()}`, task.priority, `Priority: ${task.priority}`));
  li.append(meta);

  if (task.description) li.append(el('p', 'task-description', task.description));

  const info = el('p', 'task-info');
  info.append(badge(`badge badge-status badge-status-${task.status.replace(/\s+/g, '-').toLowerCase()}`, task.status, task.status, 'Status: '));
  if (task.dueDate) {
    info.append(el('span', 'task-due', `Due ${formatDate(task.dueDate)}`));
    if (overdue) info.append(el('span', 'badge badge-overdue', '\u26A0 Overdue'));
  } else {
    info.append(el('span', 'task-due muted', 'No due date'));
  }
  li.append(info);

  const stamps = el('p', 'task-stamps', task.updatedAt !== task.createdAt
    ? `Created ${formatStamp(task.createdAt)} \u00B7 Updated ${formatStamp(task.updatedAt)}`
    : `Created ${formatStamp(task.createdAt)}`);
  li.append(stamps);

  const actions = el('div', 'task-actions');
  const statusWrap = el('div', 'status-change');
  const sel = el('select');
  sel.id = `status-${task.id}`;
  sel.dataset.action = 'status';
  sel.dataset.id = task.id;
  fillSelect(sel, STATUSES);
  sel.value = task.status;
  const lbl = el('label', '', 'Change status');
  lbl.htmlFor = sel.id;
  const hiddenTitle = el('span', 'visually-hidden', ` for ${task.title}`);
  lbl.append(hiddenTitle);
  statusWrap.append(lbl, sel);
  actions.append(statusWrap);

  const buttons = el('div', 'task-buttons');
  if (confirmingId === task.id) {
    const q = el('p', 'confirm-text', `Delete '${task.title}'? This action cannot be undone.`);
    q.setAttribute('role', 'alert');
    buttons.append(q);
    buttons.append(actionButton('Cancel', 'cancel-delete', task.id, 'btn-secondary', `Cancel deleting ${task.title}`));
    buttons.append(actionButton('Confirm', 'confirm-delete', task.id, 'btn-danger', `Confirm deleting ${task.title}`));
  } else {
    buttons.append(actionButton('Edit', 'edit', task.id, 'btn-secondary', `Edit: ${task.title}`));
    buttons.append(actionButton('Delete', 'delete', task.id, 'btn-danger-outline', `Delete: ${task.title}`));
  }
  actions.append(buttons);
  li.append(actions);
  return li;
}

/**
 * Render list, count and empty state.
 * `visible` = tasks after search/filter/sort; `total` = all tasks.
 */
function renderTaskList(visible, total, { confirmingId = null, hasCriteria = false } = {}) {
  const list = $('task-list');
  list.replaceChildren(...visible.map((t) => buildCard(t, confirmingId)));
  $('result-count').textContent = total ? `Showing ${visible.length} of ${total} ${total === 1 ? 'task' : 'tasks'}` : '';

  const empty = $('empty-state');
  empty.replaceChildren();
  empty.hidden = visible.length > 0;
  if (visible.length > 0) return;

  if (total === 0) {
    empty.append(el('h3', '', 'No tasks yet'), el('p', '', 'Create your first task to start tracking your work.'));
    const b = el('button', 'btn btn-primary', 'Create your first task');
    b.type = 'button';
    b.dataset.action = 'focus-form';
    empty.append(b);
  } else {
    empty.append(el('h3', '', hasCriteria ? 'No matching tasks' : 'Nothing to show'), el('p', '', `None of your ${total} ${total === 1 ? 'task matches' : 'tasks match'} the current search or filters. Change the search text or filters, or clear them to see all tasks.`));
    const b = el('button', 'btn btn-secondary', 'Clear search and filters');
    b.type = 'button';
    b.dataset.action = 'clear-filters';
    empty.append(b);
  }
}

/* ---------- reset (inline confirmation) ---------- */

function renderResetArea(confirming, hasTasks) {
  const area = $('reset-area');
  area.replaceChildren();
  if (!hasTasks) return;
  if (confirming) {
    area.append(el('span', 'confirm-text', 'Permanently delete ALL tasks?'));
    for (const [label, action, cls] of [['Yes, delete everything', 'confirm-reset', 'btn-danger'], ['Cancel', 'cancel-reset', 'btn-secondary']]) {
      const b = el('button', `btn btn-small ${cls}`, label);
      b.type = 'button';
      b.dataset.action = action;
      area.append(b);
    }
  } else {
    const b = el('button', 'btn btn-small btn-danger-outline', 'Reset all data');
    b.type = 'button';
    b.dataset.action = 'reset';
    area.append(b);
  }
}

const focusElement = (selector) => { const n = document.querySelector(selector); if (n) n.focus(); };

  TF.UI = { initControls, getFormValues, setFormValues, updateCounters, renderFormMode, showErrors, clearErrors, showFeedback, renderStats, renderTaskList, renderResetArea, focusElement };
})(typeof window !== 'undefined' ? window : globalThis);
