import type { ProjectChangeSummary } from '../lib/calculations';
import { formatDate } from '../lib/dates';
import { formatAddedMoney, formatMoney } from '../lib/money';
import { routes } from '../lib/router';
import { pluralize } from '../lib/text';
import type { Project } from '../types';
import { Icon } from './ui/Icon';
import { Link } from './ui/Link';
import { ProjectStatusBadge } from './ui/StatusBadge';

/** The whole card is one link (the project name), so there is a single, large click target. */
export function ProjectCard({ project, summary }: { project: Project; summary: ProjectChangeSummary }) {
  const totalChanges = summary.counts.draft + summary.counts.pending_review + summary.counts.approved + summary.counts.rejected;
  return (
    <li className="card project-card">
      <div className="project-card__head">
        <h3 className="project-card__title">
          <Link to={routes.projectDetail(project.id)} className="stretched-link">
            {project.name}
          </Link>
        </h3>
        <ProjectStatusBadge status={project.status} />
      </div>
      <p className="project-card__client">{project.clientName}</p>
      <dl className="facts">
        <div>
          <dt>Original budget</dt>
          <dd>{formatMoney(project.originalBudget, project.currency)}</dd>
        </div>
        <div>
          <dt>Target date</dt>
          <dd>{formatDate(project.originalEndDate)}</dd>
        </div>
        <div>
          <dt>Scope</dt>
          <dd>{pluralize(project.scopeItems.length, 'item')}</dd>
        </div>
        <div>
          <dt>Changes</dt>
          <dd>{totalChanges === 0 ? 'None' : pluralize(totalChanges, 'request')}</dd>
        </div>
      </dl>
      {summary.counts.pending_review > 0 ? (
        <p className="project-card__pending">
          <Icon name="clock" size={14} />
          {summary.counts.pending_review} pending review, {formatAddedMoney(summary.pendingCost, project.currency)} proposed
        </p>
      ) : null}
    </li>
  );
}
