import type { ReactNode } from 'react';
import { Icon, type IconName } from './Icon';

/** An empty screen explains what is missing and offers the next step. */
export function EmptyState({ icon = 'folder', title, children, actions, level = 3 }: { icon?: IconName; title: string; children?: ReactNode; actions?: ReactNode; level?: 2 | 3 }) {
  const Heading = level === 2 ? 'h2' : 'h3';
  return (
    <div className="empty-state">
      <span className="empty-state__icon">
        <Icon name={icon} size={24} />
      </span>
      <Heading className="empty-state__title">{title}</Heading>
      {children ? <p className="empty-state__text">{children}</p> : null}
      {actions ? <div className="empty-state__actions">{actions}</div> : null}
    </div>
  );
}
