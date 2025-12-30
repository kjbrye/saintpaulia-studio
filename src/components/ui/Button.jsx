/**
 * Button Component
 *
 * Reusable button with variants.
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
  const baseClasses = 'btn font-semibold transition-all duration-150 flex items-center justify-center gap-2';

  const variantClasses = {
    default: 'btn-secondary',
    primary: 'btn-primary',
    ghost: 'btn-ghost',
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm rounded-lg',
    md: 'px-4 py-2.5 rounded-xl',
    lg: 'px-6 py-3 text-base rounded-xl',
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
