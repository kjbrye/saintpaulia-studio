/**
 * PremiumDiscoveryTile
 *
 * Free-tier placeholder rendered in the second row of "Collection at a
 * glance". Dashed copper border, lock icon, italic teaser. Clicking it
 * surfaces the premium modal — parent owns modal state and passes the
 * feature key via onClick.
 */

import { Lock } from 'lucide-react';
import { FEATURE_LABELS } from '../../constants/plans';

const TEASERS = {
  propagation: 'Track every cutting',
  breeding: 'Watch every cross unfold',
  lineage: 'Map your lineage',
  sports: 'Catch the unusual',
  analytics: 'Spot the patterns',
  multi_photos: 'Every angle, every season',
};

export default function PremiumDiscoveryTile({ feature, onClick }) {
  const info = FEATURE_LABELS[feature];
  const teaser = TEASERS[feature] ?? info?.description ?? 'Premium feature';

  return (
    <button
      type="button"
      onClick={() => onClick?.(feature)}
      style={{
        background: 'var(--cream-100)',
        border: '2px dashed var(--copper-400)',
        borderRadius: 'var(--radius-lg)',
        padding: 16,
        textAlign: 'left',
        cursor: 'pointer',
        transition: 'all var(--transition-fast)',
        width: '100%',
        minHeight: 120,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
      aria-label={`Learn about ${info?.name ?? 'premium feature'}`}
      className="premium-discovery-tile"
    >
      <div className="flex items-center gap-2">
        <Lock size={14} style={{ color: 'var(--copper-500)' }} />
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 1.2,
            textTransform: 'uppercase',
            color: 'var(--copper-600)',
          }}
        >
          {info?.name ?? 'Premium'}
        </span>
      </div>
      <p
        style={{
          fontFamily: 'var(--font-heading)',
          fontStyle: 'italic',
          fontSize: 18,
          lineHeight: 1.3,
          color: 'var(--text-secondary)',
          marginTop: 12,
        }}
      >
        {teaser}
      </p>
    </button>
  );
}
