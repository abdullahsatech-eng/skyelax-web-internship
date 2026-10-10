import type { ReactNode } from 'react';
import { Icon, type IconName } from './Icon';

type PanelVariant = 'plain' | 'agreed' | 'proposed';

interface PanelProps {
  id: string;
  title: string;
  variant?: PanelVariant;
  icon?: IconName;
  intro?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}

/**
 * A titled section. `agreed` panels (solid edge) hold the original agreement; `proposed` panels
 * (dashed outline) hold things nobody has agreed to yet. The same visual language is used everywhere.
 */
export function Panel({ id, title, variant = 'plain', icon, intro, actions, children }: PanelProps) {
  return (
    <section className={`panel panel--${variant}`} aria-labelledby={`${id}-title`}>
      <div className="panel__head">
        <h2 id={`${id}-title`} className="panel__title">
          {icon ? <Icon name={icon} size={18} /> : null}
          {title}
        </h2>
        {actions ? <div className="panel__actions">{actions}</div> : null}
      </div>
      {intro ? <p className="panel__intro">{intro}</p> : null}
      {children}
    </section>
  );
}
