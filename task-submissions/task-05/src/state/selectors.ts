import { summarizeProjectChanges, type ProjectChangeSummary } from '../lib/calculations';
import type { ChangeRequest, Project } from '../types';

/** A lookup table keyed by id. Lets components resolve a project in O(1) instead of searching the list. */
export function indexById<T extends { id: string }>(items: T[]): Map<string, T> {
  return new Map(items.map((item) => [item.id, item]));
}

/** One summary per project, computed from a pre-grouped change map (no nested scans). */
export function buildProjectSummaries(
  projects: Project[],
  changesByProject: Map<string, ChangeRequest[]>,
): Map<string, ProjectChangeSummary> {
  return new Map(
    projects.map((project) => [project.id, summarizeProjectChanges(project, changesByProject.get(project.id) ?? [])]),
  );
}
