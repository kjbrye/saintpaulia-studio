/**
 * Button Component
 * 
 * Reusable neumorphic button with variants.
 */

import { forwardRef } from 'react';
import clsx from 'clsx';

const Button = forwardRef(function Button({
  children,
  variant = 'default',
  size = 'md',
  className,
  disabled,
  ...props
}, ref) {
  const baseClasses = 'font-semibold transition-all duration-200 flex items-center justify-center gap-2';
  
  const variantClasses = {
    default: 'neuro-button text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
    primary: 'bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-primary-500)] text-white shadow-lg hover:shadow-xl',
    ghost: 'bg-transparent hover:bg-[var(--bg-card)] text-[var(--text-secondary)]',
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm rounded-xl',
    md: 'px-5 py-3 rounded-2xl',
    lg: 'px-6 py-4 text-lg rounded-3xl',
  };

  const disabledClasses = disabled 
    ? 'opacity-50 cursor-not-allowed pointer-events-none' 
    : '';

  return (
    <button
      ref={ref}
      className={clsx(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        disabledClasses,
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
});

export default Button;
