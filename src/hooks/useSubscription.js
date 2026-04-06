/**
 * useSubscription Hook
 *
 * React Query wrapper for subscription status.
 * Provides plan info, feature gating, and plant limits.
 */

import { useQuery } from '@tanstack/react-query';
import * as subscriptionService from '../services/subscription';
import { useAuth } from './useAuth';
import { PREMIUM_FEATURES, PLANS } from '../constants/plans';

export const subscriptionKeys = {
  all: ['subscription'],
  detail: () => [...subscriptionKeys.all, 'detail'],
};

/**
 * Fetch and derive the current user's subscription state.
 *
 * Returns:
 * - subscription: raw row from subscriptions table (or null)
 * - plan: 'free' | 'premium'
 * - isPremium: boolean (active or trialing premium)
 * - plantLimit: number
 * - canUseFeature(name): boolean
 * - All standard React Query fields (isLoading, error, etc.)
 */
export function useSubscription() {
  const { isAuthenticated } = useAuth();

  const query = useQuery({
    queryKey: subscriptionKeys.detail(),
    queryFn: subscriptionService.getSubscription,
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  const subscription = query.data;
  const plan = subscription?.plan ?? 'free';
  const isPremium =
    plan === 'premium' && ['active', 'trialing'].includes(subscription?.status);
  const plantLimit = isPremium ? Infinity : PLANS.free.plantLimit;

  return {
    ...query,
    subscription,
    plan,
    isPremium,
    plantLimit,
    canUseFeature: (feature) => isPremium || !PREMIUM_FEATURES.includes(feature),
  };
}
