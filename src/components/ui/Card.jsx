/**
 * Card Component
 *
 * Paper-like card for content containers.
 */

import { forwardRef } from 'react';
import clsx from 'clsx';

const Card = forwardRef(function Card({
  children,
  className,
  variant = 'default',
  ...props
}, ref) {
  const variantClasses = {
    default: 'card',
    elevated: 'card-elevated',
    accent: 'card-accent',
    interactive: 'card-interactive',
  };

  return (
    <div
      ref={ref}
      className={clsx(variantClasses[variant], className)}
      {...props}
    >
      {children}
    </div>
  );
});

export default Card;
