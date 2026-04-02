/**
 * Lineage Service
 *
 * Database operations for pedigree/lineage data,
 * trait observations, and ancestor tree fetching.
 */

import { supabase, requireUserId } from '../api/supabase';

/**
 * Fetch a plant with its immediate parents populated.
 */
export async function getPlantWithParents(id) {
  const { data, error } = await supabase
    .from('plants')
    .select(
      `
      *,
      pod_parent:pod_parent_id (*),
      pollen_parent:pollen_parent_id (*)
    `,
    )
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Fetch multiple plants by IDs (for batch ancestor tree building).
 */
export async function getPlantsByIds(ids) {
  if (!ids || ids.length === 0) return [];
  const { data, error } = await supabase.from('plants').select('*').in('id', ids);

  if (error) throw error;
  return data;
}

/**
 * Fetch ancestors iteratively, generation by generation.
 * Returns a flat array of all ancestor plants (for building into a Map).
 *
 * @param {string} plantId - Root plant
 * @param {number} generations - How many generations back
 * @returns {Promise<Array>} All ancestor plants (flat)
 */
export async function getAncestors(plantId, generations = 4) {
  const allPlants = new Map();
  let currentIds = [plantId];

  for (let gen = 0; gen <= generations; gen++) {
    if (currentIds.length === 0) break;

    const { data, error } = await supabase.from('plants').select('*').in('id', currentIds);

    if (error) throw error;

    const nextIds = [];
    for (const plant of data || []) {
      allPlants.set(plant.id, plant);
      if (gen < generations) {
        if (plant.pod_parent_id && !allPlants.has(plant.pod_parent_id)) {
          nextIds.push(plant.pod_parent_id);
        }
        if (plant.pollen_parent_id && !allPlants.has(plant.pollen_parent_id)) {
          nextIds.push(plant.pollen_parent_id);
        }
      }
    }

    currentIds = [...new Set(nextIds)];
  }

  return Array.from(allPlants.values());
}

/**
 * Fetch all direct descendants of a plant (children only).
 */
export async function getDirectDescendants(plantId) {
  const { data, error } = await supabase
    .from('plants')
    .select('*')
    .or(`pod_parent_id.eq.${plantId},pollen_parent_id.eq.${plantId}`);

  if (error) throw error;
  return data || [];
}

/**
 * Update lineage fields on a plant.
 */
export async function updatePlantLineage(plantId, lineageData) {
  const { data, error } = await supabase
    .from('plants')
    .update({
      pod_parent_id: lineageData.pod_parent_id ?? null,
      pollen_parent_id: lineageData.pollen_parent_id ?? null,
      pod_parent_name: lineageData.pod_parent_name ?? null,
      pollen_parent_name: lineageData.pollen_parent_name ?? null,
      generation: lineageData.generation ?? null,
      lineage_notes: lineageData.lineage_notes ?? null,
      hybridizer: lineageData.hybridizer ?? null,
    })
    .eq('id', plantId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// --- Trait Observations ---

/**
 * Fetch trait observations for a plant.
 */
export async function getTraitObservations(plantId) {
  const { data, error } = await supabase
    .from('trait_observations')
    .select('*')
    .eq('plant_id', plantId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Create a trait observation.
 */
export async function createTraitObservation(observation) {
  const user_id = await requireUserId();
  const { data, error } = await supabase
    .from('trait_observations')
    .insert({ ...observation, user_id })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete a trait observation.
 */
export async function deleteTraitObservation(id) {
  const { error } = await supabase.from('trait_observations').delete().eq('id', id);

  if (error) throw error;
}
