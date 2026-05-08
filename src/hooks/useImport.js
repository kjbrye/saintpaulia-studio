/**
 * useImport Hooks
 *
 * React Query wrappers for the plant import flow.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as importsService from '../services/imports';
import { plantKeys } from './usePlants';
import { useAuth } from './useAuth';

export const importKeys = {
  all: ['imports'],
  capacity: () => [...importKeys.all, 'capacity'],
  recent: () => [...importKeys.all, 'recent'],
};

/**
 * Plan + remaining slots for the current user. Refetched after every
 * import so the UI stays consistent.
 */
export function useUserCapacity() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: importKeys.capacity(),
    queryFn: importsService.getUserCapacity,
    enabled: isAuthenticated,
    staleTime: 1000 * 30,
  });
}

/**
 * Run the full import: create the batch row, then bulk-insert plants
 * tagged with that batch.
 *
 * Caller passes { filename, fileType, plants } where `plants` has already
 * been trimmed to fit the user's capacity. The service still handles the
 * race-condition case (parallel tab adding plants) by falling back to
 * row-by-row insert and returning per-row errors.
 */
export function useImportPlants() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ filename, fileType, plants }) => {
      const batch = await importsService.createImportBatch({
        filename,
        fileType,
        rowCount: plants.length,
      });
      const result = await importsService.importPlants(plants, batch.id);
      return { ...result, batch };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: plantKeys.lists() });
      queryClient.invalidateQueries({ queryKey: importKeys.capacity() });
      queryClient.invalidateQueries({ queryKey: importKeys.recent() });
    },
  });
}

/**
 * Roll back an import: deletes every plant tagged with the batch and
 * marks the batch row rolled_back.
 */
export function useRollbackImport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (batchId) => importsService.rollbackImport(batchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: plantKeys.lists() });
      queryClient.invalidateQueries({ queryKey: importKeys.capacity() });
      queryClient.invalidateQueries({ queryKey: importKeys.recent() });
    },
  });
}

export function useRecentImports(limit = 10) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: [...importKeys.recent(), limit],
    queryFn: () => importsService.getRecentImports(limit),
    enabled: isAuthenticated,
  });
}
