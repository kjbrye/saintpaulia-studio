/**
 * PremiumFeatureModal
 *
 * Dashboard discovery modal shown when a free-tier user taps a premium tile
 * or a locked AppMenu entry. Reuses the existing Stripe checkout flow from
 * services/subscription so behavior matches UpgradePrompt.
 */

import { useEffect, useState } from 'react';
import { Crown, Loader2, Sparkles } from 'lucide-react';
import { FEATURE_LABELS, STRIPE_PRICES } from '../../constants/plans';
import { getPremiumBullets } from '../../utils/premiumCopy';
import { createCheckoutSession } from '../../services/subscription';

export default function PremiumFeatureModal({ feature, open, onClose }) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    if (!open) return;
    setErrorMessage(null);
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || !feature) return null;

  const info = FEATURE_LABELS[feature];
  const bullets = getPremiumBullets(feature);

  async function handleUpgrade() {
    setErrorMessage(null);
    const priceId = STRIPE_PRICES.monthly;
    if (!priceId) {
      setErrorMessage(
        'Upgrade isn\'t configured in this environment. Add VITE_STRIPE_PRICE_MONTHLY to .env.local.',
      );
      return;
    }
    setLoading(true);
    try {
      const { url } = await createCheckoutSession(priceId);
      if (!url) throw new Error('Checkout session returned no URL.');
      window.location.href = url;
    } catch (err) {
      setLoading(false);
      setErrorMessage(err?.message || 'Could not start checkout. Try again.');
    }
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ background: 'rgba(0, 0, 0, 0.5)' }}
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="premium-modal-title"
    >
      <div
        className="card p-6 max-w-md w-full"
        style={{ borderColor: 'var(--sage-300)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--gradient-sage-inset)' }}
          >
            <Crown size={22} style={{ color: 'var(--copper-500)' }} />
          </div>
          <div className="min-w-0">
            <h2
              id="premium-modal-title"
              className="heading heading-md"
              style={{ marginBottom: 2 }}
            >
              {info?.name ?? 'Premium feature'}
            </h2>
            <p className="text-small text-muted">
              {info?.description ?? 'Available with Saintpaulia Studio Premium.'}
            </p>
          </div>
        </div>

        {bullets.length > 0 && (
          <ul className="space-y-2 mb-5">
            {bullets.map((bullet) => (
              <li
                key={bullet}
                className="flex items-start gap-2 text-small"
                style={{ color: 'var(--text-secondary)' }}
              >
                <Sparkles
                  size={14}
                  style={{ color: 'var(--copper-500)', flexShrink: 0, marginTop: 3 }}
                />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        )}

        {errorMessage && (
          <p
            className="text-small"
            style={{ color: 'var(--copper-600)', marginBottom: 12 }}
            role="alert"
          >
            {errorMessage}
          </p>
        )}

        <div
          className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-3"
          style={{ borderTop: '1px solid var(--sage-200)' }}
        >
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Maybe later
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleUpgrade}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Redirecting…
              </>
            ) : (
              <>
                <Sparkles size={16} /> Upgrade
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
