/**
 * useHealth Hook
 *
 * React Query wrappers for health log operations.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as healthService from '../services/health';
import { plantKeys } from './usePlants';
import { useAuth } from './useAuth';

// Query key factory
export const healthKeys = {
  all: ['health'],
  logs: () => [...healthKeys.all, 'logs'],
  log: (filters) => [...healthKeys.logs(), filters],
};

/**
 * Fetch health logs, optionally filtered by plant
 */
export function useHealthLogs({ plantId, limit = 50 } = {}) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: healthKeys.log({ plantId, limit }),
    queryFn: () => healthService.getHealthLogs({ plantId, limit }),
    enabled: isAuthenticated,
  });
}

/**
 * Create a health log
 */
export function useCreateHealthLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (healthLog) => healthService.createHealthLog(healthLog),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: healthKeys.all });
      if (variables.plant_id) {
        // Update cached plant status if health_status was set
        if (variables.health_status) {
          queryClient.setQueryData(plantKeys.detail(variables.plant_id), (old) => {
            if (!old) return old;
            return { ...old, status: variables.health_status };
          });
        }
        queryClient.invalidateQueries({ queryKey: plantKeys.lists() });
      }
    },
  });
}

/**
 * Update a health log
 */
export function useUpdateHealthLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }) => healthService.updateHealthLog(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: healthKeys.all });
    },
  });
}

/**
 * Delete a health log
 */
export function useDeleteHealthLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => healthService.deleteHealthLog(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: healthKeys.all });
    },
  });
}
