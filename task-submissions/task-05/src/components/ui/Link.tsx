import type { AnchorHTMLAttributes } from 'react';

interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  /** App path such as `/projects/abc`. Rendered as a hash link so it works on static hosting. */
  to: string;
}

export function Link({ to, children, ...rest }: LinkProps) {
  return (
    <a href={`#${to}`} {...rest}>
      {children}
    </a>
  );
}
