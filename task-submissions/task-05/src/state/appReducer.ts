import type { AppData, ChangeRequest, ChangeStatus, Project } from '../types';
import { canTransition, isEditable } from '../lib/statusRules';
import type { ChangeInput, ProjectInput } from '../lib/validation';

/**
 * All application data changes go through this one pure reducer. It also enforces the business
 * rules (valid status transitions, locked approved changes, currency lock, no orphan change
 * requests), so the rules hold no matter which screen dispatches the action.
 */
export type AppAction =
  | { type: 'project/added'; project: Project }
  | { type: 'project/updated'; projectId: string; input: ProjectInput }
  | { type: 'project/deleted'; projectId: string }
  | { type: 'change/added'; change: ChangeRequest }
  | { type: 'change/updated'; changeId: string; input: Omit<ChangeInput, 'projectId'>; at: string }
  | { type: 'change/statusChanged'; changeId: string; status: ChangeStatus; at: string }
  | { type: 'change/deleted'; changeId: string }
  | { type: 'data/replaced'; data: AppData };

export function appReducer(state: AppData, action: AppAction): AppData {
  switch (action.type) {
    case 'project/added':
      return { ...state, projects: [...state.projects, action.project] };

    case 'project/updated': {
      const existing = state.projects.find((project) => project.id === action.projectId);
      if (!existing) return state;
      const hasChanges = state.changeRequests.some((change) => change.projectId === existing.id);
      const updated: Project = {
        ...existing,
        ...action.input,
        // Amounts in existing change requests have no conversion, so the currency is locked once any exist.
        currency: hasChanges ? existing.currency : action.input.currency,
      };
      return { ...state, projects: state.projects.map((project) => (project.id === existing.id ? updated : project)) };
    }

    case 'project/deleted':
      return {
        projects: state.projects.filter((project) => project.id !== action.projectId),
        changeRequests: state.changeRequests.filter((change) => change.projectId !== action.projectId),
      };

    case 'change/added':
      if (!state.projects.some((project) => project.id === action.change.projectId)) return state;
      return { ...state, changeRequests: [...state.changeRequests, action.change] };

    case 'change/updated': {
      const existing = state.changeRequests.find((change) => change.id === action.changeId);
      if (!existing || !isEditable(existing.status)) return state;
      const updated: ChangeRequest = { ...existing, ...action.input, updatedAt: action.at };
      return {
        ...state,
        changeRequests: state.changeRequests.map((change) => (change.id === existing.id ? updated : change)),
      };
    }

    case 'change/statusChanged': {
      const existing = state.changeRequests.find((change) => change.id === action.changeId);
      if (!existing || !canTransition(existing.status, action.status)) return state;
      return {
        ...state,
        changeRequests: state.changeRequests.map((change) =>
          change.id === existing.id ? { ...change, status: action.status, updatedAt: action.at } : change,
        ),
      };
    }

    case 'change/deleted':
      return { ...state, changeRequests: state.changeRequests.filter((change) => change.id !== action.changeId) };

    case 'data/replaced':
      return action.data;

    default:
      return state;
  }
}
