/**
 * Seal Component
 *
 * A rich wax seal logo with embossed effect.
 */

import { forwardRef } from 'react';
import clsx from 'clsx';

const Seal = forwardRef(function Seal({
  src,
  alt = 'Saintpaulia Studio',
  size = 'md',
  className,
  ...props
}, ref) {
  const sizes = {
    sm: { container: 'w-12 h-12', icon: 'text-lg' },
    md: { container: 'w-16 h-16', icon: 'text-2xl' },
    lg: { container: 'w-20 h-20', icon: 'text-3xl' },
    xl: { container: 'w-24 h-24', icon: 'text-4xl' },
  };

  const sealStyles = {
    background: `
      radial-gradient(ellipse at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 50%),
      radial-gradient(ellipse at 70% 70%, rgba(0,0,0,0.15) 0%, transparent 50%),
      linear-gradient(145deg, #c4894d 0%, #9a5d28 40%, #7a4820 70%, #5c3618 100%)
    `,
    boxShadow: `
      0 4px 8px rgba(92, 54, 24, 0.4),
      0 8px 24px rgba(92, 54, 24, 0.3),
      inset 0 2px 4px rgba(255, 255, 255, 0.25),
      inset 0 -2px 4px rgba(92, 54, 24, 0.4)
    `,
  };

  // With custom image
  if (src) {
    return (
      <div
        ref={ref}
        className={clsx(
          sizes[size].container,
          'rounded-full flex items-center justify-center flex-shrink-0',
          'border-2 border-[#7a4820]',
          className
        )}
        style={sealStyles}
        {...props}
      >
        <img
          src={src}
          alt={alt}
          className="w-[85%] h-[85%] object-contain rounded-full"
          style={{
            filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.3))',
          }}
        />
      </div>
    );
  }

  // Placeholder with violet flower
  return (
    <div
      ref={ref}
      className={clsx(
        sizes[size].container,
        'rounded-full flex items-center justify-center flex-shrink-0',
        'border-2 border-[#7a4820]',
        className
      )}
      style={sealStyles}
      {...props}
    >
      <span
        className={sizes[size].icon}
        style={{
          filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.4))',
        }}
        role="img"
        aria-label={alt}
      >
        🪻
      </span>
    </div>
  );
});

export default Seal;
