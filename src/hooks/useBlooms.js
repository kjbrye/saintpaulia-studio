/**
 * useBlooms Hook
 *
 * React Query wrappers for bloom log operations.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as bloomService from '../services/blooms';
import { plantKeys } from './usePlants';
import { useAuth } from './useAuth';

// Query key factory
export const bloomKeys = {
  all: ['blooms'],
  logs: () => [...bloomKeys.all, 'logs'],
  log: (filters) => [...bloomKeys.logs(), filters],
};

/**
 * Fetch bloom logs, optionally filtered by plant
 */
export function useBloomLogs({ plantId, limit = 50 } = {}) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: bloomKeys.log({ plantId, limit }),
    queryFn: () => bloomService.getBloomLogs({ plantId, limit }),
    enabled: isAuthenticated,
  });
}

/**
 * Create a bloom log
 */
export function useCreateBloomLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bloomLog) => bloomService.createBloomLog(bloomLog),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: bloomKeys.all });
      if (variables.plant_id) {
        queryClient.setQueryData(plantKeys.detail(variables.plant_id), (old) => {
          if (!old) return old;
          return { ...old, is_blooming: true };
        });
        queryClient.invalidateQueries({ queryKey: plantKeys.lists() });
      }
    },
  });
}

/**
 * Update a bloom log
 */
export function useUpdateBloomLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }) => bloomService.updateBloomLog(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bloomKeys.all });
    },
  });
}

/**
 * Delete a bloom log
 */
export function useDeleteBloomLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => bloomService.deleteBloomLog(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bloomKeys.all });
      queryClient.invalidateQueries({ queryKey: plantKeys.all });
    },
  });
}

/**
 * End a bloom (set end date + update is_blooming)
 */
export function useEndBloom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, plantId, endDate }) =>
      bloomService.endBloom(id, plantId, endDate),
    onSuccess: (_data, { plantId }) => {
      queryClient.invalidateQueries({ queryKey: bloomKeys.all });
      queryClient.invalidateQueries({ queryKey: plantKeys.detail(plantId) });
      queryClient.invalidateQueries({ queryKey: plantKeys.lists() });
    },
  });
}
