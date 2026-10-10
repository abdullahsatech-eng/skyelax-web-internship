import { AppShell } from './components/layout/AppShell';
import { useRoute } from './lib/useRoute';
import { AppDataProvider } from './state/AppContext';
import { ToastProvider } from './state/ToastContext';
import { ChangeDetailPage } from './pages/ChangeDetailPage';
import { ChangeFormPage } from './pages/ChangeFormPage';
import { ChangeRequestsPage } from './pages/ChangeRequestsPage';
import { DashboardPage } from './pages/DashboardPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { ProjectFormPage } from './pages/ProjectFormPage';
import { ProjectsPage } from './pages/ProjectsPage';

function Routes() {
  const { match } = useRoute();
  switch (match.name) {
    case 'dashboard':
      return <DashboardPage />;
    case 'projects':
      return <ProjectsPage />;
    case 'projectNew':
      return <ProjectFormPage />;
    case 'projectDetail':
      return <ProjectDetailPage projectId={match.params.projectId} />;
    case 'projectEdit':
      return <ProjectFormPage projectId={match.params.projectId} />;
    case 'changes':
      return <ChangeRequestsPage />;
    case 'changeNew':
      return <ChangeFormPage />;
    case 'changeDetail':
      return <ChangeDetailPage changeId={match.params.changeId} />;
    case 'changeEdit':
      return <ChangeFormPage changeId={match.params.changeId} />;
    default:
      return <NotFoundPage />;
  }
}

export default function App() {
  return (
    <ToastProvider>
      <AppDataProvider>
        <AppShell>
          <Routes />
        </AppShell>
      </AppDataProvider>
    </ToastProvider>
  );
}
