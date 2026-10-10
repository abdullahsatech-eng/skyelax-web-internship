import { useMemo } from 'react';
import { ChangeRequestItem } from '../components/ChangeRequestItem';
import { ProjectCard } from '../components/ProjectCard';
import { Button, ButtonLink } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Link } from '../components/ui/Link';
import { MoneyLines } from '../components/ui/MoneyLines';
import { PageHeader } from '../components/ui/PageHeader';
import { Panel } from '../components/ui/Panel';
import { StatCard } from '../components/ui/StatCard';
import { computeDashboardMetrics, groupChangesByProject } from '../lib/calculations';
import { sortNewestFirst } from '../lib/filters';
import { formatMoney } from '../lib/money';
import { routes } from '../lib/router';
import { pluralize } from '../lib/text';
import { useAppData } from '../state/AppContext';
import { buildProjectSummaries, indexById } from '../state/selectors';
import { useAppActions } from '../state/useAppActions';

export function DashboardPage() {
  const { data } = useAppData();
  const actions = useAppActions();

  // Every figure below is derived from the same records the other pages use.
  const metrics = useMemo(() => computeDashboardMetrics(data.projects, data.changeRequests), [data]);
  const projectsById = useMemo(() => indexById(data.projects), [data.projects]);
  const summaries = useMemo(
    () => buildProjectSummaries(data.projects, groupChangesByProject(data.changeRequests)),
    [data],
  );
  const recentProjects = useMemo(() => sortNewestFirst(data.projects).slice(0, 3), [data.projects]);
  const recentChanges = useMemo(() => sortNewestFirst(data.changeRequests).slice(0, 5), [data.changeRequests]);

  const hasProjects = data.projects.length > 0;
  const pendingAmounts = metrics.totals.filter((t) => t.pendingCost > 0).map((t) => ({ currency: t.currency, amount: t.pendingCost }));

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="See what was agreed, what has been proposed since, and what it could cost."
        actions={
          <>
            {hasProjects ? <ButtonLink to={routes.changeNew()} icon="plus">New change request</ButtonLink> : null}
            <ButtonLink to={routes.projectNew()} variant="primary" icon="plus">New project</ButtonLink>
          </>
        }
      />

      {!hasProjects ? (
        <EmptyState
          level={2}
          title="No projects yet"
          actions={
            <>
              <ButtonLink to={routes.projectNew()} variant="primary" icon="plus">Create your first project</ButtonLink>
              <Button icon="refresh" onClick={actions.loadDemoData}>Load demo data</Button>
            </>
          }
        >
          Create a project to record the original scope, budget and deadline. Then you can log change requests against it.
        </EmptyState>
      ) : (
        <>
          <section aria-labelledby="summary-title" className="section">
            <h2 id="summary-title" className="sr-only">Summary</h2>
            <div className="stat-grid">
              <StatCard label="Total projects" value={metrics.totalProjects} caption="In this workspace" />
              <StatCard label="Active projects" value={metrics.activeProjects} caption="Currently being delivered" />
              <StatCard label="Pending change requests" value={metrics.pendingRequests} caption={`${pluralize(metrics.draftRequests, 'more request')} in draft`} />
              <StatCard
                tone="proposed"
                label="Proposed extra cost"
                value={<MoneyLines items={pendingAmounts} emptyText="None" />}
                caption="Awaiting review. Proposed only, not confirmed revenue."
              />
            </div>
          </section>

          <div className="section">
            <Panel
              id="cost-impact"
              title="Cost impact by currency"
              intro="Approved means approved in this demonstration only. Amounts in different currencies are never added together."
            >
              <ul className="currency-grid">
                {metrics.totals.map((total) => (
                  <li key={total.currency} className="currency-card">
                    <h3 className="currency-card__title">{total.currency}</h3>
                    <dl className="currency-card__rows">
                      <div>
                        <dt>Original budgets</dt>
                        <dd>{formatMoney(total.originalBudget, total.currency)}</dd>
                      </div>
                      <div className="currency-card__approved">
                        <dt>Approved changes (demo)</dt>
                        <dd>{formatMoney(total.approvedCost, total.currency)}</dd>
                      </div>
                      <div className="currency-card__proposed">
                        <dt>Awaiting review (proposed)</dt>
                        <dd>{formatMoney(total.pendingCost, total.currency)}</dd>
                      </div>
                    </dl>
                  </li>
                ))}
              </ul>
            </Panel>
          </div>

          <div className="section split">
            <section aria-labelledby="recent-projects-title">
              <div className="section-head">
                <h2 id="recent-projects-title" className="section-title">Recent projects</h2>
                <Link to={routes.projects()} className="text-link">View all</Link>
              </div>
              <ul className="stack">
                {recentProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} summary={summaries.get(project.id)!} />
                ))}
              </ul>
            </section>

            <section aria-labelledby="recent-changes-title">
              <div className="section-head">
                <h2 id="recent-changes-title" className="section-title">Recent change requests</h2>
                <Link to={routes.changes()} className="text-link">View all</Link>
              </div>
              {recentChanges.length === 0 ? (
                <EmptyState icon="changes" title="No change requests yet" actions={<ButtonLink to={routes.changeNew()} variant="primary" icon="plus">New change request</ButtonLink>}>
                  When a client asks for something outside the original scope, record it here.
                </EmptyState>
              ) : (
                <ul className="stack">
                  {recentChanges.map((change) => (
                    <ChangeRequestItem key={change.id} change={change} project={projectsById.get(change.projectId)} showProject />
                  ))}
                </ul>
              )}
            </section>
          </div>
        </>
      )}
    </>
  );
}
