// Zero-dependency logic tests. Run: node --test tests/
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
// The app uses classic <script> files (so it also works from file://). Load them the same way here.
for (const f of ['validation', 'tasks', 'storage']) vm.runInThisContext(readFileSync(new URL(`../js/${f}.js`, import.meta.url), 'utf8'));
const { validateTaskInput, validateStoredTask, isValidDateString } = globalThis.TaskFlow.Validation;
const T = globalThis.TaskFlow.Tasks;
const { loadTasks, saveTasks, resetStorage, STORAGE_KEY, BACKUP_KEY } = globalThis.TaskFlow.Storage;

const good = { title: 'Write report', description: '', category: 'Work', priority: 'Medium', status: 'Pending', dueDate: '' };
const memStore = (initial = {}) => {
  const d = { ...initial };
  return { d, getItem: (k) => (k in d ? d[k] : null), setItem: (k, v) => { d[k] = String(v); }, removeItem: (k) => { delete d[k]; } };
};

test('validation: valid input is normalized (trimmed)', () => {
  const r = validateTaskInput({ ...good, title: '  Hello  ' });
  assert.equal(r.valid, true);
  assert.equal(r.values.title, 'Hello');
  assert.equal(r.values.dueDate, null);
});
test('validation: required-field messages match spec', () => {
  const e = validateTaskInput({ title: '', category: '', priority: '', status: '', dueDate: 'x' }).errors;
  assert.equal(e.title, 'Title is required.');
  assert.equal(e.category, 'Select a valid category.');
  assert.equal(e.priority, 'Select a valid priority.');
  assert.equal(e.status, 'Select a valid status.');
  assert.equal(e.dueDate, 'Select a valid date.');
});
test('validation: empty and whitespace-only title rejected (TC-07, TC-08)', () => {
  assert.ok(validateTaskInput({ ...good, title: '' }).errors.title);
  assert.ok(validateTaskInput({ ...good, title: '    ' }).errors.title);
});
test('validation: title 100 ok, 101 rejected and not truncated (TC-09)', () => {
  assert.equal(validateTaskInput({ ...good, title: 'a'.repeat(100) }).valid, true);
  const r = validateTaskInput({ ...good, title: 'a'.repeat(101) });
  assert.ok(r.errors.title);
  assert.equal(r.values.title.length, 101);
});
test('validation: description 500 ok, 501 rejected (TC-10)', () => {
  assert.equal(validateTaskInput({ ...good, description: 'a'.repeat(500) }).valid, true);
  assert.ok(validateTaskInput({ ...good, description: 'a'.repeat(501) }).errors.description);
});
test('validation: invalid enums rejected (TC-11)', () => {
  const r = validateTaskInput({ ...good, category: 'Hacking', priority: 'Urgent', status: 'Done' });
  assert.ok(r.errors.category && r.errors.priority && r.errors.status);
});
test('validation: dates (TC-12) - invalid rejected, past allowed, empty allowed', () => {
  assert.equal(isValidDateString('2025-02-30'), false);
  assert.equal(isValidDateString('31/12/2026'), false);
  assert.equal(isValidDateString('2024-02-29'), true);
  assert.ok(validateTaskInput({ ...good, dueDate: 'not-a-date' }).errors.dueDate);
  assert.equal(validateTaskInput({ ...good, dueDate: '2001-01-01' }).valid, true);
  assert.equal(validateTaskInput({ ...good, dueDate: '' }).valid, true);
});
test('validation: garbage input does not throw', () => {
  for (const bad of [null, undefined, 5, 'x', [], { title: 5, category: {} }]) assert.equal(validateTaskInput(bad).valid, false);
});

test('tasks: create, update, status, delete by id; duplicate titles allowed', () => {
  let { tasks, task } = T.createTask([], good);
  const a = task;
  ({ tasks, task } = T.createTask(tasks, good));
  assert.notEqual(a.id, task.id);
  assert.equal(tasks.length, 2);
  const upd = T.updateTask(tasks, a.id, { title: 'New' });
  assert.equal(upd.task.title, 'New');
  assert.equal(upd.task.createdAt, a.createdAt);
  assert.equal(T.setStatus(upd.tasks, a.id, 'Completed').task.status, 'Completed');
  const del = T.deleteTask(upd.tasks, a.id);
  assert.equal(del.tasks.length, 1);
});
test('tasks: missing id returns null, never throws', () => {
  assert.equal(T.updateTask([], 'nope', {}), null);
  assert.equal(T.setStatus([], 'nope', 'Pending'), null);
  assert.equal(T.deleteTask([], 'nope'), null);
});
test('tasks: overdue is derived (past + not completed) and stats are computed', () => {
  const now = new Date(2026, 5, 15);
  const mk = (o) => ({ ...good, id: Math.random().toString(), createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z', ...o });
  const tasks = [mk({ dueDate: '2026-06-14' }), mk({ dueDate: '2026-06-14', status: 'Completed' }), mk({ dueDate: '2026-06-15' }), mk({ status: 'In Progress' })];
  assert.equal(T.isOverdue(tasks[0], now), true);
  assert.equal(T.isOverdue(tasks[1], now), false);
  assert.equal(T.isOverdue(tasks[2], now), false); // due today is not overdue
  assert.deepEqual(T.getStats(tasks, now), { total: 4, pending: 2, inProgress: 1, completed: 1, overdue: 1 });
});
test('tasks: search, filter, sort (TC-18..21)', () => {
  const mk = (title, o) => ({ ...good, title, id: title, description: '', createdAt: `2026-01-0${title.length}T00:00:00.000Z`, updatedAt: '', ...o });
  const tasks = [mk('Bb', { priority: 'Low', dueDate: '2026-03-01' }), mk('Aaa', { priority: 'High', category: 'Study' }), mk('C', { priority: 'Medium', dueDate: '2026-02-01', status: 'Completed', description: 'find ME' })];
  const ids = (o) => T.getVisibleTasks(tasks, o).map((t) => t.id);
  assert.deepEqual(ids({ searchQuery: 'me' }), ['C']);
  assert.deepEqual(ids({ searchQuery: 'zzz' }), []);
  assert.deepEqual(ids({ filters: { status: 'Completed' } }), ['C']);
  assert.deepEqual(ids({ filters: { category: 'Study' } }), ['Aaa']);
  assert.deepEqual(ids({ filters: { priority: 'Low' } }), ['Bb']);
  assert.deepEqual(ids({ sortOption: 'priority' }), ['Aaa', 'C', 'Bb']);
  assert.deepEqual(ids({ sortOption: 'dueDate' }), ['C', 'Bb', 'Aaa']);
  assert.deepEqual(ids({ sortOption: 'title' }), ['Aaa', 'Bb', 'C']);
  assert.deepEqual(ids({ sortOption: 'oldest' }), ['C', 'Bb', 'Aaa']);
  assert.deepEqual(ids({ sortOption: 'newest' }), ['Aaa', 'Bb', 'C']);
});

test('storage: empty storage starts empty (TC-15)', () => {
  const r = loadTasks(memStore());
  assert.equal(r.status, 'empty');
  assert.deepEqual(r.tasks, []);
});
test('storage: save then load round-trips with version (TC-13, TC-14)', () => {
  const s = memStore();
  const { tasks } = T.createTask([], validateTaskInput(good).values);
  assert.equal(saveTasks(tasks, s).ok, true);
  assert.equal(JSON.parse(s.d[STORAGE_KEY]).version, 1);
  assert.deepEqual(loadTasks(s).tasks, tasks);
});
test('storage: corrupt JSON recovers and keeps backup (TC-16)', () => {
  const s = memStore({ [STORAGE_KEY]: '{not json' });
  const r = loadTasks(s);
  assert.equal(r.status, 'recovered');
  assert.deepEqual(r.tasks, []);
  assert.equal(s.d[BACKUP_KEY], '{not json');
});
test('storage: wrong structure recovers (TC-16)', () => {
  for (const raw of ['123', '"str"', 'null', '{"version":1,"tasks":"x"}']) {
    assert.equal(loadTasks(memStore({ [STORAGE_KEY]: raw })).status, 'recovered', raw);
  }
});
test('storage: bad records dropped, valid kept (TC-17)', () => {
  const { task } = T.createTask([], good);
  const raw = JSON.stringify({ version: 1, tasks: [task, { id: 'x', title: '' }, null, 5, { ...task, status: 'Nope', id: 'y' }, { ...task }] });
  const r = loadTasks(memStore({ [STORAGE_KEY]: raw }));
  assert.equal(r.status, 'recovered');
  assert.equal(r.tasks.length, 1);
  assert.equal(r.dropped, 5);
});
test('storage: write failure and unavailable storage handled', () => {
  const full = { getItem: () => null, setItem: () => { const e = new Error('q'); e.name = 'QuotaExceededError'; throw e; }, removeItem() {} };
  assert.equal(saveTasks([], full).ok, false);
  assert.match(saveTasks([], full).error, /full/);
  assert.equal(saveTasks([], null).ok, false);
  assert.equal(loadTasks(null).status, 'unavailable');
});
test('storage: reset removes data', () => {
  const s = memStore({ [STORAGE_KEY]: '{}', [BACKUP_KEY]: 'x' });
  assert.equal(resetStorage(s).ok, true);
  assert.deepEqual(s.d, {});
});
test('validateStoredTask rejects non-objects', () => {
  for (const v of [null, [], 'a', 4, {}]) assert.equal(validateStoredTask(v), null);
});
