import { RequestsPage } from './features/requests/RequestsPage';

export default function App() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <div className="site-header-inner">
          <span className="brand">
            <svg className="brand-mark" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
              <rect width="32" height="32" rx="7" fill="currentColor" />
              <path d="M8 16h6l3-6 3 12 2-6h2" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            FixFlow
          </span>
          <span className="muted header-note">Service request manager</span>
        </div>
      </header>
      <RequestsPage />
      <footer className="site-footer">
        <p>
          FixFlow is a portfolio demonstration built for the SKYELAX Web Development Internship. Any records
          shown are fictional sample data.
        </p>
      </footer>
    </>
  );
}
