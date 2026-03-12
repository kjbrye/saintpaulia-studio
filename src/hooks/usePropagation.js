/**
 * usePropagation Hook
 *
 * React Query wrapper for propagation operations.
 * Components use this hook, never the service directly.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as propagationService from '../services/propagation';
import { useAuth } from './useAuth';

// Query key factory
export const propagationKeys = {
  all: ['propagations'],
  lists: () => [...propagationKeys.all, 'list'],
  list: () => [...propagationKeys.all, 'list'],
  details: () => [...propagationKeys.all, 'detail'],
  detail: (id) => [...propagationKeys.details(), id],
};

/**
 * Fetch all propagations
 */
export function usePropagations() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: propagationKeys.list(),
    queryFn: propagationService.getPropagations,
    enabled: isAuthenticated,
  });
}

/**
 * Fetch a single propagation by ID
 */
export function usePropagation(id) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: propagationKeys.detail(id),
    queryFn: () => propagationService.getPropagationById(id),
    enabled: !!id && isAuthenticated,
  });
}

/**
 * Create a new propagation
 */
export function useCreatePropagation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => propagationService.createPropagation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: propagationKeys.lists() });
    },
  });
}

/**
 * Update an existing propagation
 */
export function useUpdatePropagation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }) => propagationService.updatePropagation(id, updates),
    onSuccess: (data, { id }) => {
      queryClient.setQueryData(propagationKeys.detail(id), data);
      queryClient.invalidateQueries({ queryKey: propagationKeys.lists() });
    },
  });
}

/**
 * Delete a propagation
 */
export function useDeletePropagation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => propagationService.deletePropagation(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: propagationKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: propagationKeys.lists() });
    },
  });
}
