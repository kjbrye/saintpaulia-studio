/**
 * Breeding Service
 *
 * All database operations for breeding cross tracking and offspring.
 * Components never call Supabase directly - they use hooks that call these functions.
 */

import { supabase, requireUserId } from '../api/supabase';

// ============================================================
// Breeding Crosses
// ============================================================

/**
 * Fetch all breeding crosses for the current user
 */
export async function getCrosses() {
  const { data, error } = await supabase
    .from('breeding_crosses')
    .select(`
      *,
      pod_parent:plants!pod_parent_id(id, cultivar_name, nickname),
      pollen_parent:plants!pollen_parent_id(id, cultivar_name, nickname)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Fetch a single cross by ID with offspring
 */
export async function getCrossById(id) {
  const { data, error } = await supabase
    .from('breeding_crosses')
    .select(`
      *,
      pod_parent:plants!pod_parent_id(id, cultivar_name, nickname),
      pollen_parent:plants!pollen_parent_id(id, cultivar_name, nickname),
      offspring(id, notes, plant:plants(id, cultivar_name, nickname))
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Create a new breeding cross
 */
export async function createCross(cross) {
  const user_id = await requireUserId();
  const { data, error } = await supabase
    .from('breeding_crosses')
    .insert({ ...cross, user_id })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update an existing cross
 */
export async function updateCross(id, updates) {
  const { data, error } = await supabase
    .from('breeding_crosses')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete a cross
 */
export async function deleteCross(id) {
  const { error } = await supabase
    .from('breeding_crosses')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============================================================
// Offspring
// ============================================================

/**
 * Add an offspring record linking a cross to a plant
 */
export async function addOffspring(offspring) {
  const { data, error } = await supabase
    .from('offspring')
    .insert(offspring)
    .select('*, plant:plants(id, cultivar_name, nickname)')
    .single();

  if (error) throw error;
  return data;
}

/**
 * Remove an offspring record
 */
export async function removeOffspring(id) {
  const { error } = await supabase
    .from('offspring')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
