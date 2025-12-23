/**
 * usePlants Hook
 * 
 * React Query wrapper for plant operations.
 * Components use this hook, never the service directly.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as plantsService from '../services/plants';

// Query key factory - keeps keys consistent across the app
export const plantKeys = {
  all: ['plants'],
  lists: () => [...plantKeys.all, 'list'],
  list: (filters) => [...plantKeys.lists(), filters],
  details: () => [...plantKeys.all, 'detail'],
  detail: (id) => [...plantKeys.details(), id],
};

/**
 * Fetch all plants
 */
export function usePlants(options = {}) {
  return useQuery({
    queryKey: plantKeys.list(options),
    queryFn: () => plantsService.getPlants(options),
  });
}

/**
 * Fetch a single plant by ID
 */
export function usePlant(id) {
  return useQuery({
    queryKey: plantKeys.detail(id),
    queryFn: () => plantsService.getPlantById(id),
    enabled: !!id, // Don't fetch if no ID
  });
}

/**
 * Create a new plant
 */
export function useCreatePlant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: plantsService.createPlant,
    onSuccess: () => {
      // Invalidate plant list to refetch
      queryClient.invalidateQueries({ queryKey: plantKeys.lists() });
    },
  });
}

/**
 * Update an existing plant
 */
export function useUpdatePlant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }) => plantsService.updatePlant(id, updates),
    onSuccess: (data, { id }) => {
      // Update the cache for this specific plant
      queryClient.setQueryData(plantKeys.detail(id), data);
      // Invalidate list to refetch
      queryClient.invalidateQueries({ queryKey: plantKeys.lists() });
    },
  });
}

/**
 * Delete a plant
 */
export function useDeletePlant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: plantsService.deletePlant,
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: plantKeys.detail(id) });
      // Invalidate list to refetch
      queryClient.invalidateQueries({ queryKey: plantKeys.lists() });
    },
  });
}
