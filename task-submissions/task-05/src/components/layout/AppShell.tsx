import { useEffect, useRef, type ReactNode } from 'react';
import { sectionOf } from '../../lib/router';
import { useRoute } from '../../lib/useRoute';
import { DataControls } from '../DataControls';
import { Icon, type IconName } from '../ui/Icon';
import { Link } from '../ui/Link';

const NAV_ITEMS: { section: 'dashboard' | 'projects' | 'changes'; to: string; label: string; icon: IconName }[] = [
  { section: 'dashboard', to: '/', label: 'Dashboard', icon: 'dashboard' },
  { section: 'projects', to: '/projects', label: 'Projects', icon: 'folder' },
  { section: 'changes', to: '/changes', label: 'Change requests', icon: 'changes' },
];

function BridgeMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <rect width="32" height="32" rx="8" fill="#0b6b7e" />
      <path d="M5 22h22" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M8 22V13M24 22V13" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M8 13c3 6 13 6 16 0" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" fill="none" strokeDasharray="1 4.2" />
    </svg>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const route = useRoute();
  const mainRef = useRef<HTMLElement>(null);
  const activeSection = sectionOf(route.path);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [route.path]);

  return (
    <div className="app-shell">
      <a
        href="#main"
        className="skip-link"
        onClick={(event) => {
          // A normal #main link would change the hash route, so move focus by script instead.
          event.preventDefault();
          mainRef.current?.focus();
        }}
      >
        Skip to main content
      </a>

      <aside className="sidebar">
        <Link to="/" className="brand" aria-label="ScopeBridge home">
          <BridgeMark />
          <span className="brand__text">
            <span className="brand__name">ScopeBridge</span>
            <span className="brand__tag">Scope and change clarity</span>
          </span>
        </Link>
        <nav className="nav" aria-label="Main">
          <ul className="nav__list">
            {NAV_ITEMS.map((item) => (
              <li key={item.section}>
                <Link to={item.to} className="nav__link" aria-current={activeSection === item.section ? 'page' : undefined}>
                  <Icon name={item.icon} size={20} />
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <div className="content-column">
        <main id="main" ref={mainRef} tabIndex={-1} className="main">
          {children}
        </main>
        <footer className="app-footer">
          <DataControls />
        </footer>
      </div>
    </div>
  );
}
