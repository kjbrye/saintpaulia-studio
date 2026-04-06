/**
 * UpgradePrompt Component
 *
 * Shown when a free-tier user tries to access a premium feature.
 * Displays feature info and upgrade buttons (monthly / annual).
 */

import { useState } from 'react';
import { Sparkles, Crown } from 'lucide-react';
import { FEATURE_LABELS, PLANS, STRIPE_PRICES } from '../../constants/plans';
import { createCheckoutSession } from '../../services/subscription';

export default function UpgradePrompt({ feature }) {
  const [loading, setLoading] = useState(null); // 'monthly' | 'annual' | null
  const featureInfo = FEATURE_LABELS[feature];

  async function handleUpgrade(interval) {
    const priceId = interval === 'monthly' ? STRIPE_PRICES.monthly : STRIPE_PRICES.annual;
    if (!priceId) return;

    setLoading(interval);
    try {
      const { url } = await createCheckoutSession(priceId);
      window.location.href = url;
    } catch {
      setLoading(null);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="card p-8 max-w-md text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ background: 'var(--gradient-sage-inset)' }}>
            <Crown size={28} style={{ color: 'var(--copper-500)' }} />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
            {featureInfo?.name ?? 'Premium Feature'}
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>
            {featureInfo?.description ?? 'This feature is available with a Premium subscription.'}
          </p>
        </div>

        <div className="space-y-3">
          <button
            className="btn btn-primary w-full"
            disabled={!!loading}
            onClick={() => handleUpgrade('monthly')}
          >
            <Sparkles size={16} />
            {loading === 'monthly'
              ? 'Redirecting...'
              : `Upgrade Monthly — $${PLANS.premium.monthlyPrice}/mo`}
          </button>

          <button
            className="btn btn-secondary w-full"
            disabled={!!loading}
            onClick={() => handleUpgrade('annual')}
          >
            {loading === 'annual'
              ? 'Redirecting...'
              : `Upgrade Annual — $${PLANS.premium.annualPrice}/yr`}
            <span className="text-xs opacity-70">(save 33%)</span>
          </button>
        </div>

        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Cancel anytime. Your data is always yours.
        </p>
      </div>
    </div>
  );
}
