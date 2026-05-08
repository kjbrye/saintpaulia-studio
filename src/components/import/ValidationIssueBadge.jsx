/**
 * ValidationIssueBadge
 *
 * Inline indicator for per-row issues. Distinguishes hard errors
 * (block import) from warnings (import but flag for review).
 */

import { AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function ValidationIssueBadge({ valid, errors = [], warnings = [] }) {
  if (!valid) {
    return (
      <span
        className="badge"
        style={{
          background: 'rgba(216, 100, 100, 0.15)',
          color: 'var(--color-error)',
          border: '1px solid var(--color-error)',
        }}
        title={errors.join('\n')}
      >
        <AlertCircle size={12} />
        {errors[0] || 'Invalid'}
      </span>
    );
  }

  if (warnings.length) {
    return (
      <span
        className="badge badge-warning"
        title={warnings.join('\n')}
      >
        <AlertTriangle size={12} />
        {warnings.length === 1 ? warnings[0] : `${warnings.length} warnings`}
      </span>
    );
  }

  return (
    <span className="badge badge-success">
      <CheckCircle2 size={12} />
      OK
    </span>
  );
}
