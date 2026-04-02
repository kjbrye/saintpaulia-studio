/**
 * useBreeding Hook
 *
 * React Query wrapper for breeding cross and offspring operations.
 * Components use this hook, never the service directly.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as breedingService from '../services/breeding';
import { useAuth } from './useAuth';

// Query key factory
export const breedingKeys = {
  all: ['breeding'],
  lists: () => [...breedingKeys.all, 'list'],
  list: () => [...breedingKeys.all, 'list'],
  details: () => [...breedingKeys.all, 'detail'],
  detail: (id) => [...breedingKeys.details(), id],
  stageLogs: (crossId) => [...breedingKeys.all, 'stageLogs', crossId],
};

/**
 * Fetch all breeding crosses
 */
export function useCrosses() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: breedingKeys.list(),
    queryFn: breedingService.getCrosses,
    enabled: isAuthenticated,
  });
}

/**
 * Fetch a single cross by ID with offspring
 */
export function useCross(id) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: breedingKeys.detail(id),
    queryFn: () => breedingService.getCrossById(id),
    enabled: !!id && isAuthenticated,
  });
}

/**
 * Create a new breeding cross
 */
export function useCreateCross() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => breedingService.createCross(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: breedingKeys.lists() });
    },
  });
}

/**
 * Update an existing cross
 */
export function useUpdateCross() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }) => breedingService.updateCross(id, updates),
    onSuccess: (data, { id }) => {
      queryClient.setQueryData(breedingKeys.detail(id), data);
      queryClient.invalidateQueries({ queryKey: breedingKeys.lists() });
    },
  });
}

/**
 * Delete a cross
 */
export function useDeleteCross() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => breedingService.deleteCross(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: breedingKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: breedingKeys.lists() });
    },
  });
}

/**
 * Add offspring to a cross
 */
export function useAddOffspring() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => breedingService.addOffspring(data),
    onSuccess: (_, { cross_id }) => {
      queryClient.invalidateQueries({ queryKey: breedingKeys.detail(cross_id) });
    },
  });
}

/**
 * Remove offspring from a cross
 */
export function useRemoveOffspring() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, cross_id }) => breedingService.removeOffspring(id),
    onSuccess: (_, { cross_id }) => {
      queryClient.invalidateQueries({ queryKey: breedingKeys.detail(cross_id) });
    },
  });
}

// ============================================================
// Stage Logs
// ============================================================

/**
 * Fetch stage logs for a cross
 */
export function useStageLogs(crossId) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: breedingKeys.stageLogs(crossId),
    queryFn: () => breedingService.getStageLogs(crossId),
    enabled: !!crossId && isAuthenticated,
  });
}

/**
 * Advance a cross to the next stage (creates log + updates cross)
 */
export function useAdvanceStage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ crossId, stage, notes, data }) =>
      breedingService.advanceStage(crossId, stage, { notes, data }),
    onSuccess: (data, { crossId }) => {
      queryClient.setQueryData(breedingKeys.detail(crossId), (old) =>
        old ? { ...old, ...data } : data,
      );
      queryClient.invalidateQueries({ queryKey: breedingKeys.stageLogs(crossId) });
      queryClient.invalidateQueries({ queryKey: breedingKeys.lists() });
    },
  });
}

/**
 * Update cross status (archive, reactivate, etc.)
 */
export function useUpdateCrossStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => breedingService.updateCrossStatus(id, status),
    onSuccess: (data, { id }) => {
      queryClient.setQueryData(breedingKeys.detail(id), (old) =>
        old ? { ...old, ...data } : data,
      );
      queryClient.invalidateQueries({ queryKey: breedingKeys.lists() });
    },
  });
}
