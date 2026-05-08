/**
 * OverCapacityBanner
 *
 * Shown above the row review table when the file has more rows than the
 * user's free-tier capacity. Frames the cap as a feature, not a punishment,
 * and gives a copper-accented upgrade CTA.
 */

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { STRIPE_PRICES } from '../../constants/plans';
import { createCheckoutSession } from '../../services/subscription';

export default function OverCapacityBanner({ availableCapacity, totalRows, maxPlants }) {
  const [loading, setLoading] = useState(false);

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
      className="p-5 rounded-xl flex items-start gap-4 flex-wrap"
      style={{
        background: 'var(--gradient-copper-card)',
        border: '1px solid var(--copper-400)',
        boxShadow: 'var(--shadow-panel)',
      }}
    >
      <div className="flex-1 min-w-0">
        <p className="heading heading-sm mb-1" style={{ color: 'var(--copper-700)' }}>
          You can import {availableCapacity} of {totalRows} plants
        </p>
        <p className="text-small" style={{ color: 'var(--copper-600)' }}>
          Your free plan supports {maxPlants} plants. To import your full collection,
          upgrade to premium for unlimited plants. Pick the {availableCapacity} you want
          first, or upgrade to bring everything over.
        </p>
      </div>

      <button
        type="button"
        onClick={handleUpgrade}
        disabled={loading}
        className="btn btn-small flex items-center gap-2"
        style={{
          background: 'linear-gradient(165deg, var(--copper-500) 0%, var(--copper-600) 100%)',
          color: 'white',
          border: '1px solid var(--copper-600)',
          boxShadow: '0 2px 4px rgba(184, 119, 80, 0.3)',
          fontWeight: 700,
        }}
      >
        <Sparkles size={14} />
        {loading ? 'Redirecting…' : `Upgrade to import all ${totalRows}`}
      </button>
    </div>
  );
}
