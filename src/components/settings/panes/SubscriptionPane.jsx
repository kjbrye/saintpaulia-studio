/**
 * SubscriptionPane
 *
 * Plan card with renewal date (long form) and a status badge, plus billing
 * management. Free-plan upgrade flow is preserved from the previous build.
 */

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useToast } from '../../../hooks/useToast';
import { useSubscription } from '../../../hooks/useSubscription';
import { createCheckoutSession, createPortalSession } from '../../../services/subscription';
import { PLANS, STRIPE_PRICES } from '../../../constants/plans';
import SettingsCard from '../SettingsCard';
import { SETTINGS_COPY } from '../../../constants/settings';

const copy = SETTINGS_COPY.subscription;

function StatusBadge({ canceling }) {
  return (
    <span
      className="px-3 py-1 rounded-full text-xs font-bold"
      style={{
        background: canceling ? 'var(--color-warning)' : 'var(--sage-200)',
        color: canceling ? 'var(--sage-900)' : 'var(--sage-800)',
        border: canceling ? '1px solid var(--copper-500)' : '1px solid var(--sage-400)',
      }}
    >
      {canceling ? copy.canceling : copy.active}
    </span>
  );
}

export default function SubscriptionPane() {
  const toast = useToast();
  const { subscription, isPremium } = useSubscription();
  const [billingLoading, setBillingLoading] = useState(false);

  const renewalDate = subscription?.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  const canceling = subscription?.cancel_at_period_end;

  const openBilling = async () => {
    setBillingLoading(true);
    try {
      const { url } = await createPortalSession();
      window.location.href = url;
    } catch {
      toast.error('Failed to open billing portal');
      setBillingLoading(false);
    }
  };

  const startCheckout = async (priceId) => {
    if (!priceId) return;
    setBillingLoading(true);
    try {
      const { url } = await createCheckoutSession(priceId);
      window.location.href = url;
    } catch {
      toast.error('Failed to start checkout');
      setBillingLoading(false);
    }
  };

  return (
    <SettingsCard label={copy.label}>
      {isPremium ? (
        <div className="space-y-4">
          <div className="card-inset p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="heading heading-md">{copy.premiumPlan}</p>
                <p className="text-small text-muted">
                  {canceling && renewalDate
                    ? `Downgrades to Free on ${renewalDate}`
                    : renewalDate
                      ? `Renews ${renewalDate}`
                      : copy.active}
                </p>
              </div>
              <StatusBadge canceling={canceling} />
            </div>
          </div>
          <button className="btn btn-secondary" disabled={billingLoading} onClick={openBilling}>
            {billingLoading ? 'Opening...' : copy.manageBilling}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="card-inset p-4">
            <p className="heading heading-md">{copy.freePlan}</p>
            <p className="text-small text-muted">{copy.freeBlurb}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              className="btn btn-primary"
              disabled={billingLoading}
              onClick={() => startCheckout(STRIPE_PRICES.annual)}
            >
              <Sparkles size={16} />
              {billingLoading ? 'Redirecting...' : `Upgrade Annual — $${PLANS.premium.annualPrice}/yr`}
            </button>
            <button
              className="btn btn-secondary"
              disabled={billingLoading}
              onClick={() => startCheckout(STRIPE_PRICES.monthly)}
            >
              {billingLoading ? 'Redirecting...' : `Upgrade Monthly — $${PLANS.premium.monthlyPrice}/mo`}
            </button>
          </div>
        </div>
      )}
    </SettingsCard>
  );
}
