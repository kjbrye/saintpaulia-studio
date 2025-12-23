/**
 * Card Component
 * 
 * Reusable neumorphic card with consistent styling.
 */

import { forwardRef } from 'react';
import clsx from 'clsx';

const Card = forwardRef(function Card({ 
  children, 
  className,
  padding = 'md',
  ...props 
}, ref) {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      ref={ref}
      className={clsx(
        'neuro-card rounded-3xl',
        paddingClasses[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

export default Card;
