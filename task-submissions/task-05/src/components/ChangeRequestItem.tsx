import { formatDate } from '../lib/dates';
import { formatAddedMoney, formatDays } from '../lib/money';
import { routes } from '../lib/router';
import type { ChangeRequest, Project } from '../types';
import { Icon } from './ui/Icon';
import { Link } from './ui/Link';
import { ChangeStatusBadge } from './ui/StatusBadge';

interface ChangeRequestItemProps {
  change: ChangeRequest;
  /** Pass the project to show its name and use its currency. */
  project: Project | undefined;
  showProject?: boolean;
}

/** Dashed outline = not agreed yet; solid green edge = approved (demo). See `data-status` in the CSS. */
export function ChangeRequestItem({ change, project, showProject = false }: ChangeRequestItemProps) {
  const currency = project?.currency ?? 'USD';
  return (
    <li className="card change-item" data-status={change.status}>
      <div className="change-item__main">
        <h3 className="change-item__title">
          <Link to={routes.changeDetail(change.id)} className="stretched-link">
            {change.title}
          </Link>
        </h3>
        <p className="change-item__meta">
          {showProject ? <span>{project ? project.name : 'Unknown project'}</span> : null}
          <span>Created {formatDate(change.createdAt)}</span>
        </p>
      </div>
      <div className="change-item__impact">
        <span className="impact-chip">
          <Icon name="wallet" size={14} />
          {change.costAdjustment > 0 ? formatAddedMoney(change.costAdjustment, currency) : 'No cost change'}
        </span>
        <span className="impact-chip">
          <Icon name="calendar" size={14} />
          {change.scheduleImpactDays > 0 ? formatDays(change.scheduleImpactDays) : 'No delay'}
        </span>
      </div>
      <div className="change-item__status">
        <ChangeStatusBadge status={change.status} />
      </div>
    </li>
  );
}
