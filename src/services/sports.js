/**
 * Sports Service
 *
 * Tracks observed bloom/foliage variations descended from plants in (or referenced
 * from) the user's collection. Components never call Supabase directly — they use
 * hooks that call these functions.
 */

import { supabase, requireUserId } from '../api/supabase';

// ============================================================
// Sports
// ============================================================

/**
 * Fetch all sports for the current user, joined with parent plant if linked.
 */
export async function getSports() {
  const { data, error } = await supabase
    .from('sports')
    .select(
      `
      *,
      parent_plant:plants!parent_plant_id(id, cultivar_name, nickname)
    `,
    )
    .order('discovered_date', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Fetch a single sport by ID with its parent plant and observations.
 */
export async function getSportById(id) {
  const { data, error } = await supabase
    .from('sports')
    .select(
      `
      *,
      parent_plant:plants!parent_plant_id(id, cultivar_name, nickname),
      observations:sport_observations(id, observed_date, trait_held, notes, created_at)
    `,
    )
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Fetch all sports descended from a given plant.
 */
export async function getSportsByParentPlant(plantId) {
  const { data, error } = await supabase
    .from('sports')
    .select('*')
    .eq('parent_plant_id', plantId)
    .order('discovered_date', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Create a new sport.
 */
export async function createSport(sport) {
  const user_id = await requireUserId();
  const payload = { ...sport, user_id };
  if (!payload.discovered_by) payload.discovered_by = null;

  const { data, error } = await supabase.from('sports').insert(payload).select().single();
  if (error) throw error;
  return data;
}

/**
 * Update an existing sport.
 */
export async function updateSport(id, updates) {
  const { data, error } = await supabase
    .from('sports')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete a sport (observations cascade via FK).
 */
export async function deleteSport(id) {
  const { error } = await supabase.from('sports').delete().eq('id', id);
  if (error) throw error;
}

// ============================================================
// Sport Observations
// ============================================================

/**
 * Fetch all observations for a sport, oldest first.
 */
export async function getSportObservations(sportId) {
  const { data, error } = await supabase
    .from('sport_observations')
    .select('*')
    .eq('sport_id', sportId)
    .order('observed_date', { ascending: true });

  if (error) throw error;
  return data;
}

/**
 * Add an observation. Returns the created row.
 */
export async function addSportObservation(observation) {
  const user_id = await requireUserId();
  const { data, error } = await supabase
    .from('sport_observations')
    .insert({ ...observation, user_id })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete an observation.
 */
export async function deleteSportObservation(id) {
  const { error } = await supabase.from('sport_observations').delete().eq('id', id);
  if (error) throw error;
}
