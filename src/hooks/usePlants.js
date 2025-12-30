/**
 * usePlants Hook
 *
 * React Query wrapper for plant operations.
 * Components use this hook, never the service directly.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as plantsService from '../services/plants';

// TODO: Remove DEV_BYPASS and MOCK_PLANTS before production
const DEV_BYPASS = true;

const MOCK_PLANTS = [
  {
    id: '1',
    nickname: 'Violet Queen',
    cultivar_name: 'Optimara EverGrace',
    photo_url: null,
    last_watered: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
    last_fertilized: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    last_groomed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    is_blooming: true,
    acquired_date: '2024-03-15',
    notes: 'Beautiful purple blooms. Gift from Mom.',
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    nickname: 'Purple Haze',
    cultivar_name: "Rob's Dandy Lion",
    photo_url: null,
    last_watered: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    last_fertilized: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), // overdue
    last_groomed: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    is_blooming: false,
    acquired_date: '2024-06-20',
    notes: 'Miniature variety. Loves bright indirect light.',
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    nickname: null,
    cultivar_name: 'Buckeye Seductress',
    photo_url: null,
    last_watered: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    last_fertilized: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    last_groomed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    is_blooming: true,
    acquired_date: '2024-01-10',
    notes: null,
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    nickname: 'Little Star',
    cultivar_name: "Ness' Crinkle Blue",
    photo_url: null,
    last_watered: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), // overdue
    last_fertilized: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    last_groomed: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(), // overdue
    is_blooming: false,
    acquired_date: '2023-11-05',
    notes: 'Semi-miniature with ruffled leaves.',
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    nickname: 'Rosie',
    cultivar_name: 'Optimara Little Maya',
    photo_url: null,
    last_watered: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    last_fertilized: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    last_groomed: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    is_blooming: false,
    acquired_date: '2024-08-01',
    notes: 'Pink flowers, compact growth.',
    updated_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

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
    queryFn: () => {
      if (DEV_BYPASS) {
        return Promise.resolve(MOCK_PLANTS);
      }
      return plantsService.getPlants(options);
    },
  });
}

/**
 * Fetch a single plant by ID
 */
export function usePlant(id) {
  return useQuery({
    queryKey: plantKeys.detail(id),
    queryFn: () => {
      if (DEV_BYPASS) {
        const plant = MOCK_PLANTS.find((p) => p.id === id);
        if (!plant) {
          return Promise.reject(new Error('Plant not found'));
        }
        return Promise.resolve(plant);
      }
      return plantsService.getPlantById(id);
    },
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
