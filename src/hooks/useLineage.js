/**
 * useLineage Hook
 *
 * React Query wrappers for lineage/pedigree operations.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as lineageService from '../services/lineage';
import { useAuth } from './useAuth';
import { plantKeys } from './usePlants';

export const lineageKeys = {
  all: ['lineage'],
  ancestors: (id, gens) => [...lineageKeys.all, 'ancestors', id, gens],
  descendants: (id) => [...lineageKeys.all, 'descendants', id],
  traits: (id) => [...lineageKeys.all, 'traits', id],
};

/**
 * Fetch ancestor tree data for a plant (flat array, build tree client-side).
 */
export function useAncestors(plantId, generations = 4) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: lineageKeys.ancestors(plantId, generations),
    queryFn: () => lineageService.getAncestors(plantId, generations),
    enabled: !!plantId && isAuthenticated,
  });
}

/**
 * Fetch direct descendants of a plant.
 */
export function useDescendants(plantId) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: lineageKeys.descendants(plantId),
    queryFn: () => lineageService.getDirectDescendants(plantId),
    enabled: !!plantId && isAuthenticated,
  });
}

/**
 * Update lineage fields on a plant.
 */
export function useUpdateLineage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, lineageData }) => lineageService.updatePlantLineage(id, lineageData),
    onSuccess: (data, { id }) => {
      // Invalidate plant detail cache
      queryClient.setQueryData(plantKeys.detail(id), data);
      queryClient.invalidateQueries({ queryKey: plantKeys.lists() });
      // Invalidate lineage caches
      queryClient.invalidateQueries({ queryKey: lineageKeys.all });
    },
  });
}

/**
 * Fetch trait observations for a plant.
 */
export function useTraitObservations(plantId) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: lineageKeys.traits(plantId),
    queryFn: () => lineageService.getTraitObservations(plantId),
    enabled: !!plantId && isAuthenticated,
  });
}

/**
 * Create a trait observation.
 */
export function useCreateTraitObservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (observation) => lineageService.createTraitObservation(observation),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: lineageKeys.traits(data.plant_id) });
    },
  });
}

/**
 * Delete a trait observation.
 */
export function useDeleteTraitObservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, plantId }) => lineageService.deleteTraitObservation(id),
    onSuccess: (_, { plantId }) => {
      queryClient.invalidateQueries({ queryKey: lineageKeys.traits(plantId) });
    },
  });
}
