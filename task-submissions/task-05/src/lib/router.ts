/**
 * Minimal hash-router logic (pure functions, no React). Hash routing is used because GitHub Pages
 * cannot rewrite unknown paths to index.html; `#/projects/abc` always loads the single page.
 */

export type RouteName =
  | 'dashboard'
  | 'projects'
  | 'projectNew'
  | 'projectDetail'
  | 'projectEdit'
  | 'changes'
  | 'changeNew'
  | 'changeDetail'
  | 'changeEdit'
  | 'notFound';

export interface RouteMatch {
  name: RouteName;
  params: Record<string, string>;
}

/** Order matters: static segments such as `new` must come before `:param` segments. */
const ROUTES: ReadonlyArray<{ name: Exclude<RouteName, 'notFound'>; pattern: string }> = [
  { name: 'dashboard', pattern: '/' },
  { name: 'projects', pattern: '/projects' },
  { name: 'projectNew', pattern: '/projects/new' },
  { name: 'projectDetail', pattern: '/projects/:projectId' },
  { name: 'projectEdit', pattern: '/projects/:projectId/edit' },
  { name: 'changes', pattern: '/changes' },
  { name: 'changeNew', pattern: '/changes/new' },
  { name: 'changeDetail', pattern: '/changes/:changeId' },
  { name: 'changeEdit', pattern: '/changes/:changeId/edit' },
];

function splitPath(path: string): string[] {
  return path.split('/').filter(Boolean);
}

function safeDecode(segment: string): string {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

export function matchRoute(path: string): RouteMatch {
  const segments = splitPath(path);
  for (const route of ROUTES) {
    const patternSegments = splitPath(route.pattern);
    if (patternSegments.length !== segments.length) continue;
    const params: Record<string, string> = {};
    const isMatch = patternSegments.every((patternSegment, index) => {
      if (patternSegment.startsWith(':')) {
        params[patternSegment.slice(1)] = safeDecode(segments[index]);
        return true;
      }
      return patternSegment === segments[index];
    });
    if (isMatch) return { name: route.name, params };
  }
  return { name: 'notFound', params: {} };
}

/** Splits `#/changes/new?project=abc` into a path and query string. */
export function parseLocationHash(hash: string): { path: string; query: URLSearchParams } {
  const withoutHash = hash.startsWith('#') ? hash.slice(1) : hash;
  const [rawPath, rawQuery = ''] = withoutHash.split('?');
  const path = rawPath === '' ? '/' : rawPath.startsWith('/') ? rawPath : `/${rawPath}`;
  return { path, query: new URLSearchParams(rawQuery) };
}

/** Which top-level navigation item a path belongs to. */
export function sectionOf(path: string): 'dashboard' | 'projects' | 'changes' | 'none' {
  const first = splitPath(path)[0];
  if (first === undefined) return 'dashboard';
  if (first === 'projects') return 'projects';
  if (first === 'changes') return 'changes';
  return 'none';
}

export const routes = {
  dashboard: () => '/',
  projects: () => '/projects',
  projectNew: () => '/projects/new',
  projectDetail: (id: string) => `/projects/${encodeURIComponent(id)}`,
  projectEdit: (id: string) => `/projects/${encodeURIComponent(id)}/edit`,
  changes: () => '/changes',
  changeNew: (projectId?: string) =>
    projectId ? `/changes/new?project=${encodeURIComponent(projectId)}` : '/changes/new',
  changeDetail: (id: string) => `/changes/${encodeURIComponent(id)}`,
  changeEdit: (id: string) => `/changes/${encodeURIComponent(id)}/edit`,
};
