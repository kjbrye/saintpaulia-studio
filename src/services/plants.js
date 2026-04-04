/**
 * Plants Service
 *
 * All database operations for plants live here.
 * Components never call Supabase directly - they use hooks that call these functions.
 */

import { supabase, requireUserId } from '../api/supabase';

/**
 * Fetch all plants for the current user
 * @param {Object} options - Query options
 * @param {string} options.orderBy - Column to order by (default: 'updated_at')
 * @param {boolean} options.ascending - Sort direction (default: false)
 * @returns {Promise<Array>} Array of plant objects
 */
export async function getPlants({ orderBy = 'updated_at', ascending = false } = {}) {
  const { data, error } = await supabase.from('plants').select('*').order(orderBy, { ascending });

  if (error) throw error;
  return data;
}

/**
 * Fetch a single plant by ID
 * @param {string} id - Plant ID
 * @returns {Promise<Object>} Plant object
 */
export async function getPlantById(id) {
  const { data, error } = await supabase.from('plants').select('*').eq('id', id).single();

  if (error) throw error;
  return data;
}

/**
 * Create a new plant
 * @param {Object} plant - Plant data
 * @returns {Promise<Object>} Created plant object
 */
export async function createPlant(plant) {
  const user_id = await requireUserId();
  const { data, error } = await supabase
    .from('plants')
    .insert({ ...plant, user_id })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update an existing plant
 * @param {string} id - Plant ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated plant object
 */
export async function updatePlant(id, updates) {
  const { data, error } = await supabase
    .from('plants')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete a plant and all associated records.
 * Removes care logs, bloom logs, health logs, and journal entries first,
 * then deletes the plant itself.
 * @param {string} id - Plant ID
 * @returns {Promise<void>}
 */
export async function deletePlant(id) {
  // Delete associated records first (order doesn't matter, all independent)
  const relatedDeletes = [
    supabase.from('care_logs').delete().eq('plant_id', id),
    supabase.from('bloom_log').delete().eq('plant_id', id),
    supabase.from('health_log').delete().eq('plant_id', id),
    supabase.from('journal_entries').delete().eq('plant_id', id),
  ];

  const results = await Promise.all(relatedDeletes);
  for (const { error } of results) {
    if (error) throw error;
  }

  // Now delete the plant
  const { error } = await supabase.from('plants').delete().eq('id', id);
  if (error) throw error;
}
