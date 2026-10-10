import { useEffect, useRef, type ReactNode } from 'react';
import { hasNavigatedInApp } from '../../lib/useRoute';
import { Icon } from './Icon';
import { Link } from './Link';

interface PageHeaderProps {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  back?: { to: string; label: string };
}

/**
 * Every page starts with one <h1>. After in-app navigation, focus moves to it, so keyboard and
 * screen-reader users land at the top of the new page and hear its name.
 */
export function PageHeader({ title, description, actions, back }: PageHeaderProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    document.title = `${title} | ScopeBridge`;
    if (hasNavigatedInApp()) headingRef.current?.focus({ preventScroll: true });
  }, [title]);

  return (
    <header className="page-header">
      {back ? (
        <Link to={back.to} className="back-link">
          <Icon name="arrowLeft" size={16} />
          {back.label}
        </Link>
      ) : null}
      <div className="page-header__row">
        <div className="page-header__text">
          <h1 ref={headingRef} tabIndex={-1} className="page-title">
            {title}
          </h1>
          {description ? <div className="page-description">{description}</div> : null}
        </div>
        {actions ? <div className="page-header__actions">{actions}</div> : null}
      </div>
    </header>
  );
}
