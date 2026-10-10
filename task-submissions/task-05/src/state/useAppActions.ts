import { useMemo } from 'react';
import { createDemoData } from '../data/demoData';
import { createId } from '../lib/ids';
import { pluralize } from '../lib/text';
import { CHANGE_STATUS_LABELS, canTransition } from '../lib/statusRules';
import type { ChangeInput, ProjectInput } from '../lib/validation';
import type { ChangeRequest, ChangeStatus, Project } from '../types';
import { useAppData } from './AppContext';
import { useToast } from './ToastContext';

/**
 * User-level operations. Each one creates ids and timestamps (impure work), dispatches a pure
 * reducer action, and then gives feedback. Pages call these instead of dispatching directly.
 */
export function useAppActions() {
  const { data, dispatch } = useAppData();
  const { notify } = useToast();

  return useMemo(
    () => ({
      createProject(input: ProjectInput): Project {
        const project: Project = { ...input, id: createId('prj'), createdAt: new Date().toISOString() };
        dispatch({ type: 'project/added', project });
        notify(`Project "${project.name}" created.`);
        return project;
      },

      updateProject(projectId: string, input: ProjectInput) {
        dispatch({ type: 'project/updated', projectId, input });
        notify(`Project "${input.name}" saved.`);
      },

      deleteProject(project: Project) {
        const removed = data.changeRequests.filter((change) => change.projectId === project.id).length;
        dispatch({ type: 'project/deleted', projectId: project.id });
        notify(`Deleted "${project.name}" and its ${pluralize(removed, 'change request')}.`, 'info');
      },

      createChange(input: ChangeInput, status: Extract<ChangeStatus, 'draft' | 'pending_review'>): ChangeRequest {
        const now = new Date().toISOString();
        const change: ChangeRequest = { ...input, id: createId('cr'), status, createdAt: now, updatedAt: now };
        dispatch({ type: 'change/added', change });
        notify(
          status === 'draft'
            ? `Draft "${change.title}" saved.`
            : `"${change.title}" saved and sent for review.`,
        );
        return change;
      },

      updateChange(changeId: string, title: string, input: Omit<ChangeInput, 'projectId'>) {
        dispatch({ type: 'change/updated', changeId, input, at: new Date().toISOString() });
        notify(`Change request "${title}" saved.`);
      },

      setChangeStatus(change: ChangeRequest, status: ChangeStatus) {
        if (!canTransition(change.status, status)) return;
        dispatch({ type: 'change/statusChanged', changeId: change.id, status, at: new Date().toISOString() });
        const demoNote = status === 'approved' || status === 'rejected' ? ' No client was notified.' : '';
        notify(`"${change.title}" is now ${CHANGE_STATUS_LABELS[status]}.${demoNote}`);
      },

      deleteChange(change: ChangeRequest) {
        dispatch({ type: 'change/deleted', changeId: change.id });
        notify(`Deleted change request "${change.title}".`, 'info');
      },

      loadDemoData() {
        dispatch({ type: 'data/replaced', data: createDemoData() });
        notify('Demo data loaded.', 'info');
      },

      clearAllData() {
        dispatch({ type: 'data/replaced', data: { projects: [], changeRequests: [] } });
        notify('All projects and change requests were removed from this browser.', 'info');
      },
    }),
    [data.changeRequests, dispatch, notify],
  );
}
