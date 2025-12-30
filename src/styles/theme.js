/**
 * Theme Tokens
 * 
 * Single source of truth for all colors, shadows, and design tokens.
 * Import these instead of hardcoding values in components.
 * 
 * These map to CSS custom properties defined in index.css
 */

export const colors = {
  // Primary palette - Sage Greens
  sage: {
    500: '#778a68',
    600: '#5d6e51',
    700: '#4a5842',
  },

  // Accent - Copper
  copper: {
    500: '#b87750',
    600: '#a66542',
  },

  // Semantic colors
  success: '#A7F3D0',
  warning: '#FCD34D',
  error: '#FCA5A5',
  info: '#7DD3FC',

  // Text colors
  text: {
    primary: '#26332a',
    secondary: '#4a5842',
    muted: '#6b7866',
  },

  // Background colors
  background: {
    base: '#f9f7f3',
    card: 'rgba(119,138,104,0.12)',
    elevated: 'rgba(119,138,104,0.18)',
  },
};

export const shadows = {
  // Soft neumorphic shadows
  card: '8px 8px 16px rgba(0, 0, 0, 0.4), -4px -4px 12px rgba(168, 159, 239, 0.1)',
  button: '4px 4px 8px rgba(0, 0, 0, 0.3), -2px -2px 6px rgba(168, 159, 239, 0.08)',
  inset: 'inset 4px 4px 8px rgba(0, 0, 0, 0.3), inset -2px -2px 6px rgba(168, 159, 239, 0.05)',
  glow: '0 0 20px rgba(168, 159, 239, 0.3)',
  heading: '0 2px 4px rgba(32, 24, 51, 0.4)',
};

export const gradients = {
  // Card backgrounds
  card: 'linear-gradient(145deg, rgba(45, 35, 66, 0.9) 0%, rgba(35, 28, 52, 0.95) 100%)',
  accent: 'linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%)',
  
  // Alert/status backgrounds
  warning: 'linear-gradient(135deg, rgba(251, 146, 60, 0.15) 0%, rgba(249, 115, 22, 0.1) 100%)',
  error: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.1) 100%)',
  success: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(22, 163, 74, 0.1) 100%)',
  
  // Decorative
  divider: 'linear-gradient(90deg, rgba(227, 201, 255, 0) 0%, rgba(227, 201, 255, 0.4) 50%, rgba(227, 201, 255, 0) 100%)',
};

export const borders = {
  subtle: '1px solid rgba(168, 159, 239, 0.2)',
  medium: '1px solid rgba(168, 159, 239, 0.3)',
  accent: '1px solid rgba(168, 159, 239, 0.5)',
  warning: '1px solid rgba(251, 146, 60, 0.3)',
  error: '1px solid rgba(239, 68, 68, 0.3)',
};

export const borderRadius = {
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  full: '9999px',
};

export const spacing = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
};

export const typography = {
  fontFamily: {
    heading: "'Playfair Display', Georgia, serif",
    body: "'Inter', system-ui, sans-serif",
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
  },
};
