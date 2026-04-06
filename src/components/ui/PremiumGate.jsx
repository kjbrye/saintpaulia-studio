/**
 * PremiumGate Component
 *
 * Wraps premium-only content. Renders children if user has access,
 * otherwise shows the upgrade prompt.
 */

import { useSubscription } from '../../hooks/useSubscription';
import UpgradePrompt from './UpgradePrompt';

export default function PremiumGate({ feature, children }) {
  const { canUseFeature, isLoading } = useSubscription();

  // Don't flash the gate while loading subscription status
  if (isLoading) return null;

  if (canUseFeature(feature)) return children;

  return <UpgradePrompt feature={feature} />;
}
