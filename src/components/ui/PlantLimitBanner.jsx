/**
 * PlantLimitBanner Component
 *
 * Shown when a free-tier user is near or at the 25-plant limit.
 */

import { useState } from 'react';
import { AlertTriangle, Sparkles } from 'lucide-react';
import { useSubscription } from '../../hooks/useSubscription';
import { STRIPE_PRICES } from '../../constants/plans';
import { createCheckoutSession } from '../../services/subscription';

export default function PlantLimitBanner({ plantCount }) {
  const { plantLimit, isPremium } = useSubscription();
  const [loading, setLoading] = useState(false);

  // Don't show for premium users or if well under limit
  if (isPremium || plantCount < plantLimit - 5) return null;

  const atLimit = plantCount >= plantLimit;
  const nearLimit = !atLimit && plantCount >= plantLimit - 5;

  async function handleUpgrade() {
    if (!STRIPE_PRICES.monthly) return;
    setLoading(true);
    try {
      const { url } = await createCheckoutSession(STRIPE_PRICES.monthly);
      window.location.href = url;
    } catch {
      setLoading(false);
    }
  }

  return (
    <div
      className="card p-4 flex items-center justify-between gap-4 flex-wrap"
      style={{
        borderColor: atLimit ? 'var(--color-error)' : 'var(--color-warning)',
        borderWidth: '1px',
        borderStyle: 'solid',
      }}
    >
      <div className="flex items-center gap-3">
        <AlertTriangle
          size={20}
          style={{ color: atLimit ? 'var(--color-error)' : 'var(--color-warning)' }}
        />
        <div>
          <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
            {atLimit
              ? `Plant limit reached (${plantCount}/${plantLimit})`
              : `Approaching plant limit (${plantCount}/${plantLimit})`}
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {atLimit
              ? 'Upgrade to Premium for unlimited plants.'
              : `${plantLimit - plantCount} spots remaining. Upgrade for unlimited plants.`}
          </p>
        </div>
      </div>

      <button
        className="btn btn-primary btn-small"
        disabled={loading}
        onClick={handleUpgrade}
      >
        <Sparkles size={14} />
        {loading ? 'Redirecting...' : 'Upgrade'}
      </button>
    </div>
  );
}
