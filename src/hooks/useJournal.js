/**
 * useJournal Hook
 *
 * React Query wrapper for journal entry operations.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as journalService from '../services/journal';
import { useAuth } from './useAuth';

// Query key factory
export const journalKeys = {
  all: ['journal'],
  forPlant: (id) => [...journalKeys.all, 'plant', id],
  forPropagation: (id) => [...journalKeys.all, 'propagation', id],
  forCross: (id) => [...journalKeys.all, 'cross', id],
};

/**
 * Fetch journal entries for a plant
 */
export function usePlantJournal(plantId) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: journalKeys.forPlant(plantId),
    queryFn: () => journalService.getJournalEntries({ plant_id: plantId }),
    enabled: !!plantId && isAuthenticated,
  });
}

/**
 * Fetch journal entries for a propagation
 */
export function usePropagationJournal(propagationId) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: journalKeys.forPropagation(propagationId),
    queryFn: () => journalService.getJournalEntries({ propagation_id: propagationId }),
    enabled: !!propagationId && isAuthenticated,
  });
}

/**
 * Fetch journal entries for a cross
 */
export function useCrossJournal(crossId) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: journalKeys.forCross(crossId),
    queryFn: () => journalService.getJournalEntries({ cross_id: crossId }),
    enabled: !!crossId && isAuthenticated,
  });
}

/**
 * Create a journal entry
 */
export function useCreateJournalEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (entry) => journalService.createJournalEntry(entry),
    onSuccess: (data) => {
      // Invalidate the relevant parent's journal query
      if (data.plant_id)
        queryClient.invalidateQueries({ queryKey: journalKeys.forPlant(data.plant_id) });
      if (data.propagation_id)
        queryClient.invalidateQueries({
          queryKey: journalKeys.forPropagation(data.propagation_id),
        });
      if (data.cross_id)
        queryClient.invalidateQueries({ queryKey: journalKeys.forCross(data.cross_id) });
    },
  });
}

/**
 * Delete a journal entry
 */
export function useDeleteJournalEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }) => journalService.deleteJournalEntry(id),
    onSuccess: (_, { parentKey }) => {
      // parentKey is the query key to invalidate, passed by caller
      if (parentKey) queryClient.invalidateQueries({ queryKey: parentKey });
    },
  });
}
