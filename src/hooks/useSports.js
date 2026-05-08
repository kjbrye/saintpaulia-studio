/**
 * useSports Hook
 *
 * React Query wrappers for sports + sport observations.
 * Components use these, never the service directly.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as sportsService from '../services/sports';
import { dashboardKeys } from './useDashboard';
import { useAuth } from './useAuth';

export const sportKeys = {
  all: ['sports'],
  lists: () => [...sportKeys.all, 'list'],
  list: () => [...sportKeys.lists()],
  byParent: (plantId) => [...sportKeys.all, 'byParent', plantId],
  details: () => [...sportKeys.all, 'detail'],
  detail: (id) => [...sportKeys.details(), id],
  observations: (sportId) => [...sportKeys.all, 'observations', sportId],
};

/**
 * List the current user's sports.
 */
export function useSports() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: sportKeys.list(),
    queryFn: sportsService.getSports,
    enabled: isAuthenticated,
  });
}

/**
 * Single sport with parent plant + embedded observations.
 */
export function useSport(id) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: sportKeys.detail(id),
    queryFn: () => sportsService.getSportById(id),
    enabled: !!id && isAuthenticated,
  });
}

/**
 * Sports descended from a given plant (used by lineage badges, plant detail).
 */
export function useSportsByParent(plantId) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: sportKeys.byParent(plantId),
    queryFn: () => sportsService.getSportsByParentPlant(plantId),
    enabled: !!plantId && isAuthenticated,
  });
}

export function useCreateSport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => sportsService.createSport(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: sportKeys.lists() });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
      if (data?.parent_plant_id) {
        queryClient.invalidateQueries({ queryKey: sportKeys.byParent(data.parent_plant_id) });
      }
    },
  });
}

export function useUpdateSport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }) => sportsService.updateSport(id, updates),
    onSuccess: (data, { id }) => {
      queryClient.setQueryData(sportKeys.detail(id), (old) =>
        old ? { ...old, ...data } : data,
      );
      queryClient.invalidateQueries({ queryKey: sportKeys.lists() });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
      if (data?.parent_plant_id) {
        queryClient.invalidateQueries({ queryKey: sportKeys.byParent(data.parent_plant_id) });
      }
    },
  });
}

export function useDeleteSport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => sportsService.deleteSport(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: sportKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: sportKeys.lists() });
      queryClient.invalidateQueries({ queryKey: [...sportKeys.all, 'byParent'] });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
}

/**
 * Observations for a sport (chronological).
 */
export function useSportObservations(sportId) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: sportKeys.observations(sportId),
    queryFn: () => sportsService.getSportObservations(sportId),
    enabled: !!sportId && isAuthenticated,
  });
}

export function useAddSportObservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => sportsService.addSportObservation(data),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: sportKeys.observations(vars.sport_id) });
      queryClient.invalidateQueries({ queryKey: sportKeys.detail(vars.sport_id) });
    },
  });
}

export function useDeleteSportObservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }) => sportsService.deleteSportObservation(id),
    onSuccess: (_, { sport_id }) => {
      if (sport_id) {
        queryClient.invalidateQueries({ queryKey: sportKeys.observations(sport_id) });
        queryClient.invalidateQueries({ queryKey: sportKeys.detail(sport_id) });
      }
    },
  });
}
