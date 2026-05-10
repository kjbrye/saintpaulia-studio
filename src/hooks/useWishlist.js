/**
 * useWishlist — React Query wrappers around the wishlist service.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as wishlistService from '../services/wishlist';
import { dashboardKeys } from './useDashboard';
import { useAuth } from './useAuth';

export const wishlistKeys = {
  all: ['wishlist'],
  lists: () => [...wishlistKeys.all, 'list'],
  detail: (id) => [...wishlistKeys.all, 'detail', id],
};

export function useWishlistItems() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: wishlistKeys.lists(),
    queryFn: wishlistService.getWishlistItems,
    enabled: isAuthenticated,
  });
}

export function useWishlistItem(id) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: wishlistKeys.detail(id),
    queryFn: () => wishlistService.getWishlistItemById(id),
    enabled: !!id && isAuthenticated,
  });
}

function invalidateAll(queryClient) {
  queryClient.invalidateQueries({ queryKey: wishlistKeys.all });
  queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
}

export function useCreateWishlistItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: wishlistService.createWishlistItem,
    onSuccess: () => invalidateAll(queryClient),
  });
}

export function useUpdateWishlistItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }) => wishlistService.updateWishlistItem(id, updates),
    onSuccess: () => invalidateAll(queryClient),
  });
}

export function useDeleteWishlistItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => wishlistService.deleteWishlistItem(id),
    onSuccess: () => invalidateAll(queryClient),
  });
}

export function useMarkWishlistItemAcquired() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, plantId }) =>
      wishlistService.markWishlistItemAcquired(id, plantId),
    onSuccess: () => invalidateAll(queryClient),
  });
}
