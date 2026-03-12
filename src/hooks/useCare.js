/**
 * useCare Hook
 *
 * React Query wrappers for care log operations.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as careService from '../services/care';
import { plantKeys } from './usePlants';

// Query key factory
export const careKeys = {
  all: ['care'],
  logs: () => [...careKeys.all, 'logs'],
  log: (filters) => [...careKeys.logs(), filters],
  recent: (limit) => [...careKeys.all, 'recent', limit],
};

/**
 * Fetch care logs, optionally filtered by plant
 */
export function useCareLogs({ plantId, limit = 50 } = {}) {
  return useQuery({
    queryKey: careKeys.log({ plantId, limit }),
    queryFn: () => careService.getCareLogs({ plantId, limit }),
  });
}

/**
 * Fetch recent care logs across all plants
 */
export function useRecentCareLogs(limit = 10) {
  return useQuery({
    queryKey: careKeys.recent(limit),
    queryFn: () => careService.getRecentCareLogs(limit),
  });
}

/**
 * Log a care action
 */
export function useLogCare() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ plantId, careType, notes, fertilizerType, potSize }) =>
      careService.logCare(plantId, careType, notes, fertilizerType, potSize),
    onSuccess: (newLog, { plantId, careType, potSize }) => {
      // Invalidate care logs
      queryClient.invalidateQueries({ queryKey: careKeys.all });

      // Update the plant's last care date in the cache
      const updateField = {
        watering: 'last_watered',
        fertilizing: 'last_fertilized',
        grooming: 'last_groomed',
        repotting: 'last_repotted',
      }[careType];

      if (updateField || (careType === 'repotting' && potSize)) {
        // Update the detail cache
        queryClient.setQueryData(plantKeys.detail(plantId), (oldPlant) => {
          if (!oldPlant) return oldPlant;
          const updates = {};
          if (updateField) {
            updates[updateField] = newLog.care_date;
          }
          if (careType === 'repotting' && potSize) {
            updates.pot_size = potSize;
          }
          return { ...oldPlant, ...updates };
        });

        // Invalidate lists to refetch
        queryClient.invalidateQueries({ queryKey: plantKeys.lists() });
      }
    },
  });
}
