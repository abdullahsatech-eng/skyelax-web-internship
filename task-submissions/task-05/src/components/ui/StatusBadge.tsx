import { CHANGE_STATUS_LABELS, PROJECT_STATUS_LABELS } from '../../lib/statusRules';
import type { ChangeStatus, ProjectStatus } from '../../types';
import { Icon, type IconName } from './Icon';

const CHANGE_ICONS: Record<ChangeStatus, IconName> = {
  draft: 'edit',
  pending_review: 'clock',
  approved: 'check',
  rejected: 'x',
};

/** Status is shown with an icon AND text, never colour alone. */
export function ChangeStatusBadge({ status }: { status: ChangeStatus }) {
  return (
    <span className={`badge badge--${status}`}>
      <Icon name={CHANGE_ICONS[status]} size={14} />
      {CHANGE_STATUS_LABELS[status]}
    </span>
  );
}

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return <span className={`badge badge--project-${status}`}>{PROJECT_STATUS_LABELS[status]}</span>;
}
