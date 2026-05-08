/**
 * CapacityIndicator
 *
 * Compact display of the user's plan + remaining import slots.
 * Used at the upload step and again on the review step.
 */

import { Sparkles, Sprout } from 'lucide-react';

export default function CapacityIndicator({ capacity, compact = false }) {
  if (!capacity) return null;
  const { plan, currentPlantCount, maxPlants, availableCapacity } = capacity;
  const isPremium = plan === 'premium';

  if (isPremium) {
    return (
      <div
        className="flex items-center gap-2 text-small"
        style={{ color: 'var(--copper-600)' }}
      >
        <Sparkles size={16} />
        <span className="font-semibold">Premium — no limit</span>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-small" style={{ color: 'var(--sage-700)' }}>
        <Sprout size={14} />
        <span>
          <strong>{availableCapacity}</strong> of {maxPlants} slots available
        </span>
      </div>
    );
  }

  return (
    <div
      className="card-subtle p-4 flex items-center gap-3"
      style={{ background: 'var(--gradient-sage-card)' }}
    >
      <Sprout size={20} style={{ color: 'var(--sage-600)' }} />
      <div>
        <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
          {availableCapacity} of {maxPlants} plant slots available
        </p>
        <p className="text-small" style={{ color: 'var(--text-muted)' }}>
          {currentPlantCount === 0
            ? `Import up to ${maxPlants} plants on your free plan. Need more? Upgrade anytime.`
            : `You have ${currentPlantCount} plants in your collection.`}
        </p>
      </div>
    </div>
  );
}
