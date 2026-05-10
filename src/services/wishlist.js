/**
 * Wishlist Service
 *
 * CRUD for wishlist_items. RLS scopes everything to the authed user.
 */

import { supabase, requireUserId } from '../api/supabase';

export async function getWishlistItems() {
  const { data, error } = await supabase
    .from('wishlist_items')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getWishlistItemById(id) {
  const { data, error } = await supabase
    .from('wishlist_items')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function createWishlistItem(item) {
  const user_id = await requireUserId();
  const { data, error } = await supabase
    .from('wishlist_items')
    .insert({ ...item, user_id })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateWishlistItem(id, updates) {
  const { data, error } = await supabase
    .from('wishlist_items')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteWishlistItem(id) {
  const { error } = await supabase.from('wishlist_items').delete().eq('id', id);
  if (error) throw error;
}

/**
 * Mark a wishlist item as acquired and link it to the new plant. Called
 * from AddPlant after a successful plant insert when the form was launched
 * from a wishlist item.
 */
export async function markWishlistItemAcquired(id, plantId) {
  const { data, error } = await supabase
    .from('wishlist_items')
    .update({
      status: 'acquired',
      acquired_at: new Date().toISOString(),
      acquired_plant_id: plantId,
    })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
