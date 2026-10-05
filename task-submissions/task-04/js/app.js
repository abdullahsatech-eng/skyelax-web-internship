/* app.js - state, event wiring and orchestration. */
(function () {
  'use strict';
  const { validateTaskInput } = TaskFlow.Validation;
  const Tasks = TaskFlow.Tasks;
  const { loadTasks, saveTasks, resetStorage } = TaskFlow.Storage;
  const UI = TaskFlow.UI;


const DEFAULT_FILTERS = { status: 'all', category: 'all', priority: 'all' };

const state = {
  tasks: [],
  searchQuery: '',
  filters: { ...DEFAULT_FILTERS },
  sortOption: 'newest',
  editingTaskId: null,
  confirmingDeleteId: null,
  confirmingReset: false,
};

const $ = (id) => document.getElementById(id);

function hasCriteria() {
  return state.searchQuery.trim() !== '' || Object.values(state.filters).some((v) => v !== 'all');
}

function render() {
  const visible = Tasks.getVisibleTasks(state.tasks, state);
  UI.renderStats(state.tasks);
  UI.renderTaskList(visible, state.tasks.length, { confirmingId: state.confirmingDeleteId, hasCriteria: hasCriteria() });
  UI.renderResetArea(state.confirmingReset, state.tasks.length > 0);
  UI.renderFormMode(state.editingTaskId !== null);
}

/** Persist after a state change; report failures honestly. Returns true when saved. */
function persist() {
  const result = saveTasks(state.tasks);
  if (!result.ok) UI.showFeedback(`${result.error} Your change is visible now but will be lost when you close or refresh this page.`, 'error');
  return result.ok;
}

function exitEditMode() {
  state.editingTaskId = null;
  UI.setFormValues();
  UI.clearErrors();
}

/* ---------- handlers ---------- */

function handleSubmit(event) {
  event.preventDefault();
  const result = validateTaskInput(UI.getFormValues());
  if (!result.valid) {
    UI.showErrors(result.errors);
    UI.showFeedback('Please correct the highlighted fields.', 'error');
    return;
  }
  UI.clearErrors();

  if (state.editingTaskId) {
    const updated = Tasks.updateTask(state.tasks, state.editingTaskId, result.values);
    if (!updated) {
      exitEditMode();
      render();
      UI.showFeedback('That task no longer exists, so nothing was updated. You can create it again as a new task.', 'error');
      return;
    }
    state.tasks = updated.tasks;
    exitEditMode();
    render();
    if (persist()) UI.showFeedback('Task updated successfully.');
    UI.focusElement(`[data-action="edit"][data-id="${updated.task.id}"]`);
    return;
  }

  const created = Tasks.createTask(state.tasks, result.values);
  state.tasks = created.tasks;
  UI.setFormValues();
  render();
  if (persist()) UI.showFeedback('Task added successfully.');
  $('title').focus();
}

function startEdit(id) {
  const task = state.tasks.find((t) => t.id === id);
  if (!task) {
    render();
    UI.showFeedback('That task no longer exists. The list has been refreshed.', 'error');
    return;
  }
  state.editingTaskId = id;
  state.confirmingDeleteId = null;
  UI.clearErrors();
  UI.setFormValues(task);
  render();
  $('form-panel').scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  $('title').focus({ preventScroll: true });
}

function confirmDelete(id) {
  const removed = Tasks.deleteTask(state.tasks, id);
  state.confirmingDeleteId = null;
  if (!removed) {
    render();
    UI.showFeedback('That task was already deleted or could not be found.', 'error');
    return;
  }
  state.tasks = removed.tasks;
  if (state.editingTaskId === id) exitEditMode();
  render();
  if (persist()) UI.showFeedback('Task deleted successfully.');
  $('task-list-heading').focus();
}

function changeStatus(id, status) {
  const result = Tasks.setStatus(state.tasks, id, status);
  if (!result) {
    render();
    UI.showFeedback('That task no longer exists. The list has been refreshed.', 'error');
    return;
  }
  state.tasks = result.tasks;
  render();
  if (persist()) UI.showFeedback(`Task status changed to ${status}.`);
  UI.focusElement(`#status-${CSS.escape(id)}`);
}

function clearFilters() {
  state.searchQuery = '';
  state.filters = { ...DEFAULT_FILTERS };
  $('search').value = '';
  $('filter-status').value = $('filter-category').value = $('filter-priority').value = 'all';
  render();
  $('search').focus();
}

function handleClick(event) {
  const target = event.target.closest('[data-action]');
  if (!target || target.tagName === 'SELECT') return;
  const { action, id } = target.dataset;
  switch (action) {
    case 'edit': startEdit(id); break;
    case 'delete':
      state.confirmingDeleteId = id;
      render();
      UI.focusElement(`[data-action="confirm-delete"][data-id="${CSS.escape(id)}"]`);
      break;
    case 'cancel-delete':
      state.confirmingDeleteId = null;
      render();
      UI.focusElement(`[data-action="delete"][data-id="${CSS.escape(id)}"]`);
      break;
    case 'confirm-delete': confirmDelete(id); break;
    case 'focus-form': $('title').focus(); break;
    case 'clear-filters': clearFilters(); break;
    case 'reset':
      state.confirmingReset = true;
      render();
      UI.focusElement('[data-action="confirm-reset"]');
      break;
    case 'cancel-reset':
      state.confirmingReset = false;
      render();
      UI.focusElement('[data-action="reset"]');
      break;
    case 'confirm-reset': {
      const result = resetStorage();
      state.tasks = [];
      state.confirmingReset = false;
      exitEditMode();
      render();
      if (result.ok) UI.showFeedback('All tasks were deleted.');
      else UI.showFeedback(`${result.error} Tasks were cleared from the screen only.`, 'error');
      $('title').focus();
      break;
    }
    default: break;
  }
}

function init() {
  UI.initControls();

  const loaded = loadTasks();
  state.tasks = loaded.tasks;

  $('task-form').addEventListener('submit', handleSubmit);
  $('task-form').addEventListener('input', (e) => { if (e.target.id === 'title' || e.target.id === 'description') UI.updateCounters(); });
  $('cancel-btn').addEventListener('click', () => { exitEditMode(); render(); UI.showFeedback('Edit cancelled.', 'warning'); $('title').focus(); });
  $('clear-btn').addEventListener('click', () => { UI.setFormValues(state.editingTaskId ? state.tasks.find((t) => t.id === state.editingTaskId) : undefined); UI.clearErrors(); UI.showFeedback('Form cleared.', 'warning'); $('title').focus(); });
  $('new-task-btn').addEventListener('click', () => {
    if (state.editingTaskId) { exitEditMode(); render(); }
    $('form-panel').scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    $('title').focus({ preventScroll: true });
  });
  document.addEventListener('click', handleClick);
  $('task-list').addEventListener('change', (e) => { if (e.target.dataset.action === 'status') changeStatus(e.target.dataset.id, e.target.value); });
  $('toolbar').addEventListener('submit', (e) => e.preventDefault());
  $('search').addEventListener('input', (e) => { state.searchQuery = e.target.value; render(); });
  $('filter-status').addEventListener('change', (e) => { state.filters.status = e.target.value; render(); });
  $('filter-category').addEventListener('change', (e) => { state.filters.category = e.target.value; render(); });
  $('filter-priority').addEventListener('change', (e) => { state.filters.priority = e.target.value; render(); });
  $('sort').addEventListener('change', (e) => { state.sortOption = e.target.value; render(); });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (state.confirmingDeleteId || state.confirmingReset) { state.confirmingDeleteId = null; state.confirmingReset = false; render(); }
    else if (state.editingTaskId && e.target.closest('#task-form')) { $('cancel-btn').click(); }
  });

  render();
  if (loaded.status === 'recovered') persist(); // rewrite cleaned data; original kept in backup key
  if (loaded.message) UI.showFeedback(loaded.message, loaded.status === 'empty' ? 'success' : 'warning');
}

init();
})();
