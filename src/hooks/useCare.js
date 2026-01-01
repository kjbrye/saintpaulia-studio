/**
 * useCare Hook
 *
 * React Query wrappers for care log operations.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as careService from '../services/care';
import { plantKeys } from './usePlants';

// TODO: Remove DEV_BYPASS and MOCK_CARE_LOGS before production
const DEV_BYPASS = true;

const MOCK_CARE_LOGS = [
  {
    id: '1',
    plant_id: '1',
    care_type: 'watering',
    care_date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    notes: '',
    plants: { id: '1', nickname: 'Violet Queen', cultivar_name: 'Optimara EverGrace', photo_url: null },
  },
  {
    id: '2',
    plant_id: '3',
    care_type: 'grooming',
    care_date: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    notes: 'Removed dead leaves',
    plants: { id: '3', nickname: null, cultivar_name: 'Buckeye Seductress', photo_url: null },
  },
  {
    id: '3',
    plant_id: '5',
    care_type: 'watering',
    care_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    notes: '',
    plants: { id: '5', nickname: 'Rosie', cultivar_name: 'Optimara Little Maya', photo_url: null },
  },
  {
    id: '4',
    plant_id: '2',
    care_type: 'fertilizing',
    care_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    notes: 'Quarter strength',
    fertilizer_type: 'balanced',
    plants: { id: '2', nickname: 'Purple Haze', cultivar_name: "Rob's Dandy Lion", photo_url: null },
  },
  {
    id: '5',
    plant_id: '4',
    care_type: 'watering',
    care_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    notes: '',
    plants: { id: '4', nickname: 'Little Star', cultivar_name: "Ness' Crinkle Blue", photo_url: null },
  },
];

// Query key factory
export const careKeys = {
  all: ['care'],
  logs: () => [...careKeys.all, 'logs'],
  log: (filters) => [...careKeys.logs(), filters],
  recent: (limit) => [...careKeys.all, 'recent', limit],
};

/**
 * Fetch care logs, optionally filtered by plant
 */
export function useCareLogs({ plantId, limit = 50 } = {}) {
  return useQuery({
    queryKey: careKeys.log({ plantId, limit }),
    queryFn: () => {
      if (DEV_BYPASS) {
        let logs = MOCK_CARE_LOGS;
        if (plantId) {
          logs = logs.filter(log => log.plant_id === plantId);
        }
        return Promise.resolve(logs.slice(0, limit));
      }
      return careService.getCareLogs({ plantId, limit });
    },
  });
}

/**
 * Fetch recent care logs across all plants
 */
export function useRecentCareLogs(limit = 10) {
  return useQuery({
    queryKey: careKeys.recent(limit),
    queryFn: () => {
      if (DEV_BYPASS) {
        return Promise.resolve(MOCK_CARE_LOGS.slice(0, limit));
      }
      return careService.getRecentCareLogs(limit);
    },
  });
}

/**
 * Log a care action
 */
export function useLogCare() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ plantId, careType, notes, fertilizerType }) => {
      if (DEV_BYPASS) {
        // Mock care log creation for development
        const newLog = {
          id: String(Date.now()),
          plant_id: plantId,
          care_type: careType,
          care_date: new Date().toISOString(),
          notes: notes || '',
          fertilizer_type: careType === 'fertilizing' ? fertilizerType : null,
        };
        MOCK_CARE_LOGS.unshift(newLog);
        return Promise.resolve(newLog);
      }
      return careService.logCare(plantId, careType, notes, fertilizerType);
    },
    onSuccess: (_, { plantId }) => {
      // Invalidate care logs
      queryClient.invalidateQueries({ queryKey: careKeys.all });
      // Invalidate the plant (last_watered etc. changed)
      queryClient.invalidateQueries({ queryKey: plantKeys.detail(plantId) });
      queryClient.invalidateQueries({ queryKey: plantKeys.lists() });
    },
  });
}
