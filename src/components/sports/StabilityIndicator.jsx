/**
 * StabilityIndicator - Visual badge showing a sport's stability status.
 *
 * Color mapping:
 *   stable             → sage (success)
 *   partially_stable   → purple
 *   unstable           → copper (warning)
 *   unconfirmed        → neutral cream
 *
 * Pass `observations` to derive percentage from history; or pass `status` directly.
 */

import { calculateStability } from '../../utils/sportDescription';

const STATUS_LABELS = {
  unconfirmed: 'Unconfirmed',
  unstable: 'Unstable',
  partially_stable: 'Partially stable',
  stable: 'Stable',
};

const STATUS_STYLES = {
  unconfirmed: {
    background: 'var(--cream-200)',
    color: 'var(--sage-600)',
    border: '1px solid var(--cream-400)',
  },
  unstable: {
    background: 'rgba(255, 203, 125, 0.2)',
    color: 'var(--copper-600)',
    border: 'var(--border-copper)',
  },
  partially_stable: {
    background: 'var(--purple-100)',
    color: 'var(--purple-500)',
    border: 'var(--border-purple)',
  },
  stable: {
    background: 'rgba(179, 208, 155, 0.2)',
    color: 'var(--sage-700)',
    border: '1px solid var(--color-success)',
  },
};

export default function StabilityIndicator({
  status,
  observations,
  showPercentage = true,
  size = 'md',
}) {
  const stats = observations ? calculateStability(observations) : null;
  const effectiveStatus = status || stats?.suggestedStatus || 'unconfirmed';
  const style = STATUS_STYLES[effectiveStatus] || STATUS_STYLES.unconfirmed;
  const label = STATUS_LABELS[effectiveStatus] || STATUS_LABELS.unconfirmed;

  const padding = size === 'sm' ? '2px 8px' : '4px 10px';
  const fontSize = size === 'sm' ? 11 : 12;

  return (
    <span
      className="badge"
      style={{ ...style, padding, fontSize, fontWeight: 600 }}
      title={
        stats && stats.totalCount > 0
          ? `${stats.stableCount} of ${stats.totalCount} observations held the trait`
          : 'No observations recorded yet'
      }
    >
      {label}
      {showPercentage && stats && stats.percentage !== null && (
        <span style={{ opacity: 0.75, marginLeft: 4 }}>· {stats.percentage}%</span>
      )}
    </span>
  );
}
