import { describe, expect, it } from 'vitest';
import { makeChange, makeProject } from '../test/factories';
import { filterChangeRequests, filterProjects, sortNewestFirst } from './filters';
import { matchRoute, parseLocationHash, routes, sectionOf } from './router';
import { allowedTransitions, canTransition, isEditable } from './statusRules';

describe('status rules', () => {
  it('allows the intended workflow and every decision can be reopened', () => {
    expect(canTransition('draft', 'pending_review')).toBe(true);
    expect(canTransition('pending_review', 'approved')).toBe(true);
    expect(canTransition('pending_review', 'rejected')).toBe(true);
    expect(canTransition('approved', 'pending_review')).toBe(true);
    expect(canTransition('rejected', 'pending_review')).toBe(true);
  });

  it('blocks shortcuts that skip review', () => {
    expect(canTransition('draft', 'approved')).toBe(false);
    expect(canTransition('draft', 'rejected')).toBe(false);
    expect(canTransition('approved', 'rejected')).toBe(false);
    expect(canTransition('approved', 'draft')).toBe(false);
    expect(allowedTransitions('approved')).toEqual(['pending_review']);
  });

  it('locks approved and rejected changes for editing', () => {
    expect(isEditable('draft')).toBe(true);
    expect(isEditable('pending_review')).toBe(true);
    expect(isEditable('approved')).toBe(false);
    expect(isEditable('rejected')).toBe(false);
  });
});

describe('filters', () => {
  const projects = [
    makeProject({ id: 'p1', name: 'Bakery Website', clientName: 'Harbor Bakery', status: 'active' }),
    makeProject({ id: 'p2', name: 'Dental Portal', clientName: 'Lumen Dental', status: 'planning' }),
  ];
  const byId = new Map(projects.map((p) => [p.id, p]));
  const changes = [
    makeChange({ id: 'c1', projectId: 'p1', title: 'Add pre-orders', status: 'draft' }),
    makeChange({ id: 'c2', projectId: 'p2', title: 'Translate pages', status: 'pending_review' }),
  ];

  it('searches several words across name, client and description (all words must match)', () => {
    expect(filterProjects(projects, { query: 'harbor bakery', status: 'all' }).map((p) => p.id)).toEqual(['p1']);
    expect(filterProjects(projects, { query: 'HARBOR dental', status: 'all' })).toHaveLength(0);
  });

  it('combines search with a status filter and restores the full list when cleared', () => {
    expect(filterProjects(projects, { query: '', status: 'planning' }).map((p) => p.id)).toEqual(['p2']);
    expect(filterProjects(projects, { query: '', status: 'all' })).toHaveLength(2);
  });

  it('filters change requests by text, project name, status and project', () => {
    expect(filterChangeRequests(changes, byId, { query: 'lumen', status: 'all', projectId: 'all' }).map((c) => c.id)).toEqual(['c2']);
    expect(filterChangeRequests(changes, byId, { query: '', status: 'draft', projectId: 'all' }).map((c) => c.id)).toEqual(['c1']);
    expect(filterChangeRequests(changes, byId, { query: '', status: 'all', projectId: 'p2' }).map((c) => c.id)).toEqual(['c2']);
    expect(filterChangeRequests(changes, byId, { query: 'zzz', status: 'all', projectId: 'all' })).toHaveLength(0);
  });

  it('sorts newest first without mutating the input', () => {
    const input = [
      makeChange({ id: 'a', createdAt: '2026-01-01T00:00:00.000Z' }),
      makeChange({ id: 'b', createdAt: '2026-03-01T00:00:00.000Z' }),
    ];
    expect(sortNewestFirst(input).map((c) => c.id)).toEqual(['b', 'a']);
    expect(input.map((c) => c.id)).toEqual(['a', 'b']);
  });
});

describe('router', () => {
  it('matches every route and prefers static segments over parameters', () => {
    expect(matchRoute('/').name).toBe('dashboard');
    expect(matchRoute('/projects').name).toBe('projects');
    expect(matchRoute('/projects/new').name).toBe('projectNew');
    expect(matchRoute('/projects/abc')).toEqual({ name: 'projectDetail', params: { projectId: 'abc' } });
    expect(matchRoute('/projects/abc/edit')).toEqual({ name: 'projectEdit', params: { projectId: 'abc' } });
    expect(matchRoute('/changes/new').name).toBe('changeNew');
    expect(matchRoute('/changes/cr_1')).toEqual({ name: 'changeDetail', params: { changeId: 'cr_1' } });
    expect(matchRoute('/changes/cr_1/edit').name).toBe('changeEdit');
  });

  it('returns notFound for unknown paths', () => {
    expect(matchRoute('/nope').name).toBe('notFound');
    expect(matchRoute('/projects/a/b/c').name).toBe('notFound');
  });

  it('parses hashes with and without query strings', () => {
    expect(parseLocationHash('').path).toBe('/');
    expect(parseLocationHash('#').path).toBe('/');
    expect(parseLocationHash('#/projects').path).toBe('/projects');
    const parsed = parseLocationHash('#/changes/new?project=p%201');
    expect(parsed.path).toBe('/changes/new');
    expect(parsed.query.get('project')).toBe('p 1');
  });

  it('maps paths to navigation sections and builds encoded links', () => {
    expect(sectionOf('/')).toBe('dashboard');
    expect(sectionOf('/projects/abc/edit')).toBe('projects');
    expect(sectionOf('/changes')).toBe('changes');
    expect(sectionOf('/zzz')).toBe('none');
    expect(routes.projectDetail('a b')).toBe('/projects/a%20b');
    expect(routes.changeNew('p1')).toBe('/changes/new?project=p1');
    expect(routes.changeNew()).toBe('/changes/new');
  });
});
