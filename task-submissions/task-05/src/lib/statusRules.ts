import type { ChangeStatus, ProjectStatus } from '../types';

export const CHANGE_STATUS_LABELS: Record<ChangeStatus, string> = {
  draft: 'Draft',
  pending_review: 'Pending review',
  approved: 'Approved (demo)',
  rejected: 'Rejected (demo)',
};

export const CHANGE_STATUS_HELP: Record<ChangeStatus, string> = {
  draft: 'Still being written. Not counted in any totals.',
  pending_review: 'Ready for a decision. Counted as proposed cost, not as agreed cost.',
  approved: 'Demonstration only. No client was contacted and nothing is legally binding.',
  rejected: 'Demonstration only. Excluded from all revised figures.',
};

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  planning: 'Planning',
  active: 'Active',
  on_hold: 'On hold',
  completed: 'Completed',
};

/**
 * Allowed status transitions. Every decision can be reopened, so a mis-click is recoverable.
 * approved/rejected changes are locked for editing until they are reopened.
 */
const TRANSITIONS: Record<ChangeStatus, readonly ChangeStatus[]> = {
  draft: ['pending_review'],
  pending_review: ['approved', 'rejected', 'draft'],
  approved: ['pending_review'],
  rejected: ['pending_review', 'draft'],
};

export function allowedTransitions(from: ChangeStatus): readonly ChangeStatus[] {
  return TRANSITIONS[from];
}

export function canTransition(from: ChangeStatus, to: ChangeStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

/** Only unresolved changes may be edited, so an agreed or declined change is never rewritten silently. */
export function isEditable(status: ChangeStatus): boolean {
  return status === 'draft' || status === 'pending_review';
}

export function transitionActionLabel(from: ChangeStatus, to: ChangeStatus): string {
  if (to === 'pending_review') return from === 'draft' ? 'Send for review' : 'Reopen for review';
  if (to === 'approved') return 'Mark approved (demo)';
  if (to === 'rejected') return 'Mark rejected (demo)';
  return 'Return to draft';
}
