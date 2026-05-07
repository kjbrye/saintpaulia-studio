/**
 * SportDescriptionPreview - Renders the canonical AVSA-style description string
 * for a sport. Pure display: pass it a sport object (or partial form state).
 */

import { buildSportDescription } from '../../utils/sportDescription';

export default function SportDescriptionPreview({ sport, placeholder, className = '' }) {
  const text = buildSportDescription(sport);

  if (!text) {
    return (
      <p className={`text-small text-muted italic ${className}`.trim()}>
        {placeholder || 'Description will appear here as you fill in the fields.'}
      </p>
    );
  }

  return (
    <p
      className={`heading heading-sm ${className}`.trim()}
      style={{ color: 'var(--purple-500)', fontStyle: 'italic', lineHeight: 1.4 }}
    >
      {text}
    </p>
  );
}
