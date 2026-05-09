/**
 * usePropagation Hook
 *
 * React Query wrapper for propagation operations.
 * Components use this hook, never the service directly.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as propagationService from '../services/propagation';
import { dashboardKeys } from './useDashboard';
import { useAuth } from './useAuth';

export const propagationKeys = {
  all: ['propagations'],
  lists: () => [...propagationKeys.all, 'list'],
  list: () => [...propagationKeys.all, 'list'],
  details: () => [...propagationKeys.all, 'detail'],
  detail: (id) => [...propagationKeys.details(), id],
};

export function usePropagations() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: propagationKeys.list(),
    queryFn: propagationService.getPropagations,
    enabled: isAuthenticated,
  });
}

export function usePropagation(id) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: propagationKeys.detail(id),
    queryFn: () => propagationService.getPropagationById(id),
    enabled: !!id && isAuthenticated,
  });
}

function invalidateAll(queryClient, id) {
  if (id) queryClient.invalidateQueries({ queryKey: propagationKeys.detail(id) });
  queryClient.invalidateQueries({ queryKey: propagationKeys.lists() });
  queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
}

export function useCreatePropagation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => propagationService.createPropagation(data),
    onSuccess: () => invalidateAll(queryClient),
  });
}

export function useUpdatePropagation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }) => propagationService.updatePropagation(id, updates),
    onSuccess: (data, { id }) => {
      queryClient.setQueryData(propagationKeys.detail(id), data);
      invalidateAll(queryClient);
    },
  });
}

export function useDeletePropagation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => propagationService.deletePropagation(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: propagationKeys.detail(id) });
      invalidateAll(queryClient);
    },
  });
}

export function useAdvanceStage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, nextStage, note }) =>
      propagationService.advanceStage(id, nextStage, note),
    onSuccess: (data, { id }) => {
      queryClient.setQueryData(propagationKeys.detail(id), data);
      invalidateAll(queryClient, id);
    },
  });
}

export function useMarkFailed() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, note }) => propagationService.markFailed(id, note),
    onSuccess: (data, { id }) => {
      queryClient.setQueryData(propagationKeys.detail(id), data);
      invalidateAll(queryClient, id);
    },
  });
}

export function useUnmarkFailed() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }) => propagationService.unmarkFailed(id),
    onSuccess: (data, { id }) => {
      queryClient.setQueryData(propagationKeys.detail(id), data);
      invalidateAll(queryClient, id);
    },
  });
}

export function useEstablishPropagation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, plantId }) => propagationService.establishPropagation(id, plantId),
    onSuccess: (data, { id }) => {
      queryClient.setQueryData(propagationKeys.detail(id), data);
      invalidateAll(queryClient, id);
    },
  });
}
