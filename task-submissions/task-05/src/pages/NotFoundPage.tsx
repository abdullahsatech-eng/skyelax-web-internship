import { ButtonLink } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { PageHeader } from '../components/ui/PageHeader';

/** Shown for unknown URLs and for ids that do not exist (for example, after a record was deleted). */
export function NotFoundPage({ title = 'Page not found', message }: { title?: string; message?: string }) {
  return (
    <>
      <PageHeader title={title} />
      <EmptyState level={2} icon="alert" title={title} actions={
        <>
          <ButtonLink to="/" variant="primary" icon="dashboard">Go to dashboard</ButtonLink>
          <ButtonLink to="/projects" icon="folder">View projects</ButtonLink>
        </>
      }>
        {message ?? 'The address does not match anything in ScopeBridge. Use the navigation to find what you need.'}
      </EmptyState>
    </>
  );
}
