/**
 * useDashboard Hooks
 *
 * Thin React Query wrappers around the dashboard service.
 *
 * All hooks key by `userId` so the cache resets cleanly on sign-in/out, and
 * share the `['dashboard']` namespace so any care, bloom, propagation,
 * cross, or sport mutation can invalidate the whole dashboard at once via
 * `queryClient.invalidateQueries({ queryKey: dashboardKeys.all })`.
 */

import { useQuery } from '@tanstack/react-query';
import * as dashboardService from '../services/dashboard';
import { useAuth } from './useAuth';
import { useSubscription } from './useSubscription';
import { useSettings } from './useSettings.jsx';

const STALE_TIME = 60 * 1000;

export const dashboardKeys = {
  all: ['dashboard'],
  overdue: (userId, thresholds) => [...dashboardKeys.all, 'overdue', userId, thresholds],
  bloomsToUpdate: (userId) => [...dashboardKeys.all, 'blooms-to-update', userId],
  collectionCounts: (userId) => [...dashboardKeys.all, 'counts', userId],
  recentActivity: (userId, limit) => [...dashboardKeys.all, 'activity', userId, limit],
  latestMilestone: (userId, isPremium) => [
    ...dashboardKeys.all,
    'milestone',
    userId,
    isPremium,
  ],
};

function useUserId() {
  const { user, isAuthenticated } = useAuth();
  return { userId: user?.id ?? null, isAuthenticated };
}

export function useOverdueCounts() {
  const { userId, isAuthenticated } = useUserId();
  const { careThresholds } = useSettings();
  return useQuery({
    queryKey: dashboardKeys.overdue(userId, careThresholds),
    queryFn: () => dashboardService.getOverdueCounts(careThresholds),
    enabled: isAuthenticated,
    staleTime: STALE_TIME,
  });
}

export function useBloomsToUpdate() {
  const { userId, isAuthenticated } = useUserId();
  return useQuery({
    queryKey: dashboardKeys.bloomsToUpdate(userId),
    queryFn: dashboardService.getBloomsToUpdate,
    enabled: isAuthenticated,
    staleTime: STALE_TIME,
  });
}

export function useCollectionCounts() {
  const { userId, isAuthenticated } = useUserId();
  return useQuery({
    queryKey: dashboardKeys.collectionCounts(userId),
    queryFn: dashboardService.getCollectionCounts,
    enabled: isAuthenticated,
    staleTime: STALE_TIME,
  });
}

export function useRecentActivity(limit = 8) {
  const { userId, isAuthenticated } = useUserId();
  return useQuery({
    queryKey: dashboardKeys.recentActivity(userId, limit),
    queryFn: () => dashboardService.getRecentActivity(limit),
    enabled: isAuthenticated,
    staleTime: STALE_TIME,
  });
}

export function useLatestMilestone() {
  const { userId, isAuthenticated } = useUserId();
  const { isPremium } = useSubscription();
  return useQuery({
    queryKey: dashboardKeys.latestMilestone(userId, isPremium),
    queryFn: () => dashboardService.getLatestMilestone({ isPremium }),
    enabled: isAuthenticated,
    staleTime: STALE_TIME,
  });
}
