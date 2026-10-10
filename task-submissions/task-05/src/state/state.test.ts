import { describe, expect, it } from 'vitest';
import { createDemoData } from '../data/demoData';
import { isChangeRequest, isProject, loadAppData, parseStoredData, saveAppData, STORAGE_KEY, type StorageLike } from '../lib/storage';
import { makeChange, makeProject } from '../test/factories';
import type { AppData } from '../types';
import { appReducer } from './appReducer';

const baseState = (): AppData => ({
  projects: [makeProject({ id: 'p1' }), makeProject({ id: 'p2', name: 'Other' })],
  changeRequests: [
    makeChange({ id: 'c1', projectId: 'p1', status: 'draft' }),
    makeChange({ id: 'c2', projectId: 'p1', status: 'approved' }),
    makeChange({ id: 'c3', projectId: 'p2', status: 'pending_review' }),
  ],
});

describe('appReducer', () => {
  it('deletes a project together with its change requests (no orphans)', () => {
    const next = appReducer(baseState(), { type: 'project/deleted', projectId: 'p1' });
    expect(next.projects.map((p) => p.id)).toEqual(['p2']);
    expect(next.changeRequests.map((c) => c.id)).toEqual(['c3']);
  });

  it('refuses a change request for a project that does not exist', () => {
    const state = baseState();
    expect(appReducer(state, { type: 'change/added', change: makeChange({ id: 'x', projectId: 'ghost' }) })).toBe(state);
  });

  it('applies valid status changes and records the update time', () => {
    const next = appReducer(baseState(), { type: 'change/statusChanged', changeId: 'c3', status: 'approved', at: 'NOW' });
    const changed = next.changeRequests.find((c) => c.id === 'c3');
    expect(changed?.status).toBe('approved');
    expect(changed?.updatedAt).toBe('NOW');
  });

  it('ignores invalid status transitions', () => {
    const state = baseState();
    expect(appReducer(state, { type: 'change/statusChanged', changeId: 'c1', status: 'approved', at: 'NOW' })).toBe(state);
  });

  it('does not edit approved changes', () => {
    const state = baseState();
    const next = appReducer(state, {
      type: 'change/updated', changeId: 'c2', at: 'NOW',
      input: { title: 'Hacked', description: 'x', costAdjustment: 1, scheduleImpactDays: 1 },
    });
    expect(next).toBe(state);
  });

  it('edits a draft change without touching its project or status', () => {
    const next = appReducer(baseState(), {
      type: 'change/updated', changeId: 'c1', at: 'NOW',
      input: { title: 'New title', description: 'd', costAdjustment: 42, scheduleImpactDays: 2 },
    });
    const changed = next.changeRequests.find((c) => c.id === 'c1');
    expect(changed).toMatchObject({ title: 'New title', costAdjustment: 42, status: 'draft', projectId: 'p1' });
  });

  it('locks the currency once a project has change requests but not before', () => {
    const input = { ...makeProject({ id: 'p1' }), currency: 'EUR' as const };
    const withChanges = appReducer(baseState(), { type: 'project/updated', projectId: 'p1', input });
    expect(withChanges.projects.find((p) => p.id === 'p1')?.currency).toBe('USD');

    const noChanges: AppData = { projects: [makeProject({ id: 'p1' })], changeRequests: [] };
    const free = appReducer(noChanges, { type: 'project/updated', projectId: 'p1', input });
    expect(free.projects[0].currency).toBe('EUR');
  });

  it('keeps id and creation date when a project is edited', () => {
    const input = { ...makeProject({ id: 'p1' }), name: 'Renamed' };
    const next = appReducer(baseState(), { type: 'project/updated', projectId: 'p1', input });
    expect(next.projects[0]).toMatchObject({ id: 'p1', name: 'Renamed', createdAt: '2026-09-01T00:00:00.000Z' });
  });
});

describe('demo data', () => {
  it('is internally consistent', () => {
    const data = createDemoData();
    const ids = new Set(data.projects.map((p) => p.id));
    expect(data.projects.every(isProject)).toBe(true);
    expect(data.changeRequests.every(isChangeRequest)).toBe(true);
    expect(data.changeRequests.every((c) => ids.has(c.projectId))).toBe(true);
    expect(new Set(data.changeRequests.map((c) => c.id)).size).toBe(data.changeRequests.length);
  });

  it('returns fresh copies on every call', () => {
    expect(createDemoData()).not.toBe(createDemoData());
  });
});

function memoryStorage(initial?: string): StorageLike & { value: string | null } {
  const store = { value: initial ?? null };
  return {
    get value() { return store.value; },
    getItem: () => store.value,
    setItem: (_key, value) => { store.value = value; },
  };
}

describe('storage', () => {
  it('falls back to demo data when nothing is stored', () => {
    expect(loadAppData(memoryStorage()).projects.length).toBeGreaterThan(0);
  });

  it('falls back to demo data for malformed JSON or the wrong shape', () => {
    expect(loadAppData(memoryStorage('{not json')).projects.length).toBeGreaterThan(0);
    expect(loadAppData(memoryStorage('"hello"')).projects.length).toBeGreaterThan(0);
    expect(loadAppData(memoryStorage('{"projects":1}')).projects.length).toBeGreaterThan(0);
  });

  it('keeps an intentionally empty data set (it is not malformed)', () => {
    const loaded = loadAppData(memoryStorage('{"projects":[],"changeRequests":[]}'));
    expect(loaded).toEqual({ projects: [], changeRequests: [] });
  });

  it('drops invalid records and orphaned change requests', () => {
    const good = makeProject({ id: 'p1' });
    const raw = JSON.stringify({
      projects: [good, { id: 'broken' }, { ...good, id: 'p2', originalBudget: 'lots' }],
      changeRequests: [
        makeChange({ id: 'c1', projectId: 'p1' }),
        makeChange({ id: 'c2', projectId: 'p2' }),
        { ...makeChange({ id: 'c3', projectId: 'p1' }), costAdjustment: Number.NaN },
        { ...makeChange({ id: 'c4', projectId: 'p1' }), status: 'bogus' },
      ],
    });
    const parsed = parseStoredData(raw);
    expect(parsed?.projects.map((p) => p.id)).toEqual(['p1']);
    expect(parsed?.changeRequests.map((c) => c.id)).toEqual(['c1']);
  });

  it('round-trips data and survives a storage that throws', () => {
    const storage = memoryStorage();
    const data = createDemoData();
    expect(saveAppData(data, storage)).toBe(true);
    expect(storage.value).not.toBeNull();
    expect(loadAppData(storage)).toEqual(data);

    const broken: StorageLike = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('full'); } };
    expect(saveAppData(data, broken)).toBe(false);
    expect(loadAppData(broken).projects.length).toBeGreaterThan(0);
    expect(STORAGE_KEY).toContain('scopebridge');
  });
});
