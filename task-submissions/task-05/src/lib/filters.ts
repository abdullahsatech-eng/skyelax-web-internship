import type { ChangeRequest, ChangeStatus, Project, ProjectStatus } from '../types';

/**
 * Search and filtering. Each list is scanned once (O(n * k) for k search words); project names are
 * looked up through a Map, so filtering change requests never rescans the project list per row.
 */

function toTerms(query: string): string[] {
  return query.toLowerCase().split(/\s+/).filter(Boolean);
}

function matchesAll(haystack: string, terms: string[]): boolean {
  return terms.every((term) => haystack.includes(term));
}

export interface ProjectFilter {
  query: string;
  status: ProjectStatus | 'all';
}

export function filterProjects(projects: Project[], filter: ProjectFilter): Project[] {
  const terms = toTerms(filter.query);
  return projects.filter((project) => {
    if (filter.status !== 'all' && project.status !== filter.status) return false;
    if (terms.length === 0) return true;
    return matchesAll(`${project.name} ${project.clientName} ${project.description}`.toLowerCase(), terms);
  });
}

export interface ChangeFilter {
  query: string;
  status: ChangeStatus | 'all';
  projectId: string | 'all';
}

export function filterChangeRequests(
  changes: ChangeRequest[],
  projectsById: Map<string, Project>,
  filter: ChangeFilter,
): ChangeRequest[] {
  const terms = toTerms(filter.query);
  return changes.filter((change) => {
    if (filter.status !== 'all' && change.status !== filter.status) return false;
    if (filter.projectId !== 'all' && change.projectId !== filter.projectId) return false;
    if (terms.length === 0) return true;
    const project = projectsById.get(change.projectId);
    const haystack = `${change.title} ${change.description} ${project?.name ?? ''} ${project?.clientName ?? ''}`.toLowerCase();
    return matchesAll(haystack, terms);
  });
}

/** Newest first. Ties are broken by id so the order is stable. */
export function sortNewestFirst<T extends { createdAt: string; id: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt) || a.id.localeCompare(b.id));
}
