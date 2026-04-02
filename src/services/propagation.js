/**
 * Propagation Service
 *
 * All database operations for propagation tracking.
 * Components never call Supabase directly - they use hooks that call these functions.
 */

import { supabase, requireUserId } from '../api/supabase';

/**
 * Fetch all propagations for the current user
 */
export async function getPropagations() {
  const { data, error } = await supabase
    .from('propagations')
    .select('*, parent_plant:plants(id, cultivar_name, nickname)')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Fetch a single propagation by ID
 */
export async function getPropagationById(id) {
  const { data, error } = await supabase
    .from('propagations')
    .select('*, parent_plant:plants(id, cultivar_name, nickname)')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Create a new propagation
 */
export async function createPropagation(propagation) {
  const user_id = await requireUserId();
  const { data, error } = await supabase
    .from('propagations')
    .insert({ ...propagation, user_id })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update an existing propagation
 */
export async function updatePropagation(id, updates) {
  const { data, error } = await supabase
    .from('propagations')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete a propagation
 */
export async function deletePropagation(id) {
  const { error } = await supabase.from('propagations').delete().eq('id', id);

  if (error) throw error;
}
