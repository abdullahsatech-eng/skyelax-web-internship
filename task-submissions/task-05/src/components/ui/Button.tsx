import type { AnchorHTMLAttributes, ComponentProps } from 'react';
import { Icon, type IconName } from './Icon';
import { Link } from './Link';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size = 'md' | 'sm';

function classes(variant: Variant, size: Size, extra?: string) {
  return ['btn', `btn--${variant}`, size === 'sm' ? 'btn--sm' : '', extra ?? ''].filter(Boolean).join(' ');
}

interface ButtonProps extends ComponentProps<'button'> {
  variant?: Variant;
  size?: Size;
  icon?: IconName;
}

export function Button({ variant = 'secondary', size = 'md', icon, className, type = 'button', children, ...rest }: ButtonProps) {
  return (
    <button type={type} className={classes(variant, size, className)} {...rest}>
      {icon ? <Icon name={icon} size={size === 'sm' ? 16 : 18} /> : null}
      <span>{children}</span>
    </button>
  );
}

interface ButtonLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  to: string;
  variant?: Variant;
  size?: Size;
  icon?: IconName;
}

/** A link that looks like a button. Use for navigation; use <Button> for actions. */
export function ButtonLink({ to, variant = 'secondary', size = 'md', icon, className, children, ...rest }: ButtonLinkProps) {
  return (
    <Link to={to} className={classes(variant, size, className)} {...rest}>
      {icon ? <Icon name={icon} size={size === 'sm' ? 16 : 18} /> : null}
      <span>{children}</span>
    </Link>
  );
}
